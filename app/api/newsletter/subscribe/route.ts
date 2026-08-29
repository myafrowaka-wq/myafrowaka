import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { subscribe } from '@/lib/newsletter'
import { buildConfirmEmail } from '@/lib/newsletterEmail'
import { hasResend, sendEmail } from '@/lib/resend'

// Session 5.1 — the real thing components/NewsletterPopup.tsx should have
// called all along instead of faking success on a timer. Public and
// unauthenticated (most subscribers will never have an account), but
// records who's signed in if anyone is, purely as a bonus.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_SOURCES = ['popup', 'newsletter-page']
// Same vocabulary and the same "validate against it server-side" pattern
// already established in app/api/user/profile/route.ts's TRAVEL_STYLES —
// the Sanity schema's options.list only constrains Studio's editing UI, not
// writes made through the API, so an unvalidated client value would sit in
// newsletterSubscriber.interests as unfiltered junk, defeating the entire
// point of a field that exists to segment sends.
const VALID_INTERESTS = [
  'Solo Travelers', 'Couples', 'Families', 'Backpackers',
  'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
]

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    email?: string; homeCountryId?: string; interests?: string[]; source?: string
  } | null
  const email = body?.email?.trim().toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const source = VALID_SOURCES.includes(body?.source ?? '') ? body!.source : undefined
  const interests = Array.isArray(body?.interests)
    ? body.interests.filter(i => typeof i === 'string' && VALID_INTERESTS.includes(i)).slice(0, 8)
    : undefined

  const session = await auth().catch(() => null)

  const result = await subscribe({
    email,
    homeCountryId: body?.homeCountryId,
    interests,
    source,
    linkedUserId: session?.user?.id,
  })

  if (result.needsConfirmEmail && result.confirmToken && result.unsubscribeToken) {
    const origin = req.headers.get('origin') ?? new URL(req.url).origin
    const confirmUrl = `${origin}/newsletter/confirm/${result.confirmToken}`
    const unsubscribeUrl = `${origin}/newsletter/unsubscribe/${result.unsubscribeToken}`
    const { subject, text, html } = buildConfirmEmail({ confirmUrl, unsubscribeUrl, origin })

    if (hasResend) {
      const sent = await sendEmail({ to: email, subject, text, html })
      if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 500 })
    } else {
      // No real Resend key configured — same honest fallback as every
      // other email flow in this app: log the real links server-side and
      // hand them back so this is genuinely testable locally.
      console.log(`[Newsletter] No RESEND_API_KEY configured. Confirm link for ${email}:\n${confirmUrl}\nUnsubscribe link:\n${unsubscribeUrl}`)
      return NextResponse.json({ ok: true, devLink: confirmUrl, devUnsubscribeLink: unsubscribeUrl })
    }
  }

  // Same response whether this created a new pending subscriber, re-armed
  // an old one, or found an already-confirmed one updating preferences —
  // the wording has to stay true in all three cases without confirming to
  // an outside caller which one just happened.
  return NextResponse.json({ ok: true })
}
