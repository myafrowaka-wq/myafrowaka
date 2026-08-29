import { NextResponse } from 'next/server'
import { confirmSubscription } from '@/lib/newsletter'

// POST — the actual state change, fired only by an explicit button click on
// app/newsletter/confirm/[token]/page.tsx. Deliberately not a GET on the
// page itself: an email client or corporate security gateway pre-fetching
// every link in an email is common, and it must never be the thing that
// confirms a subscription nobody asked for.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { token?: string } | null
  if (!body?.token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 })

  const result = await confirmSubscription(body.token)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
