import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'
import { createTripInvite } from '@/lib/tripInvite'
import { buildInviteEmail } from '@/lib/inviteEmail'
import { hasResend, sendEmail } from '@/lib/resend'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_INVITES = 5

// POST — the trip owner invites up to 5 people by email, each getting a
// real branded email with a personal note and a link to see the trip and
// join it. Session 4.1's decided spec (build a real magic-link flow with
// an honest dev fallback when Resend isn't configured) applies here too —
// see lib/resend.ts.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const trip = await writeClient.fetch<{
    _id: string; userId: string; name: string
    country?: { name: string } | null
    dates?: { from?: string; to?: string }
    days?: { items?: unknown[] }[]
  } | null>(
    `*[_type == "savedTrip" && _id == $id][0]{
      _id, userId, name, "country": country->{ name }, dates, days
    }`,
    { id }
  )
  if (!trip) return NextResponse.json({ error: 'Trip not found.' }, { status: 404 })
  if (trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Only the trip owner can invite people.' }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { emails?: string[]; note?: string } | null
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const emails = Array.from(new Set((body.emails ?? []).map(e => e.trim().toLowerCase()).filter(Boolean)))
  if (emails.length === 0) return NextResponse.json({ error: 'Add at least one email.' }, { status: 400 })
  if (emails.length > MAX_INVITES) return NextResponse.json({ error: `Up to ${MAX_INVITES} people at a time.` }, { status: 400 })
  const invalid = emails.filter(e => !EMAIL_RE.test(e))
  if (invalid.length > 0) return NextResponse.json({ error: `Not a valid email: ${invalid[0]}` }, { status: 400 })

  const note = (body.note ?? '').trim().slice(0, 500)
  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const itemCount = (trip.days ?? []).reduce((n, d) => n + (d.items?.length ?? 0), 0)

  const results: { email: string; sent: boolean; devLink?: string }[] = []

  for (const email of emails) {
    const rawToken = await createTripInvite({
      tripId: trip._id,
      email,
      note,
      invitedByUserId: session.user.id,
      invitedByName: session.user.name ?? session.user.email ?? 'Someone',
    })
    const acceptUrl = `${origin}/trips/join/${rawToken}`

    const { subject, text, html } = buildInviteEmail({
      inviterName: session.user.name ?? session.user.email ?? 'Someone',
      tripName: trip.name,
      countryName: trip.country?.name ?? 'Africa',
      from: trip.dates?.from,
      to: trip.dates?.to,
      note,
      itemCount,
      acceptUrl,
      origin,
    })

    if (hasResend) {
      const result = await sendEmail({ to: email, subject, text, html })
      results.push({ email, sent: result.ok })
    } else {
      // No real Resend key configured — same honest fallback as the
      // magic-link flow: log the real link server-side and hand it back
      // in the response so the invite is genuinely testable locally.
      console.log(`[Trip Invite] No RESEND_API_KEY configured. Invite link for ${email}:\n${acceptUrl}`)
      results.push({ email, sent: false, devLink: acceptUrl })
    }
  }

  return NextResponse.json({ ok: true, results })
}
