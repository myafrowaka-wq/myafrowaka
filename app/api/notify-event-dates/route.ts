import { NextRequest, NextResponse } from 'next/server'

// Session 3.3 — "Notify me when 2027 dates are announced," for an event
// whose date isn't confirmed yet (lib/eventDateDisplay.ts already refuses
// to show a fabricated date for exactly these events; this is the honest
// alternative action to offer in its place).
//
// Follows the same real fallback already established in
// app/api/contact/route.ts, not the fake one in components/NewsletterPopup.tsx
// (which calls setSubmitted(true) on a timer without ever sending the
// address anywhere — found while building this route, out of scope to fix
// here, flagged to the owner separately). No RESEND_API_KEY exists yet
// (Session 4.3's job), so every submission is logged server-side in the
// meantime — a real record, not a client-side illusion of one — and moves
// to actually emailing the moment that key exists, with no code change
// needed on this end.

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { email, eventName, eventSlug } = body

  if (!email?.trim() || !eventName?.trim() || !eventSlug?.trim()) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey) {
    console.log('[MyAfroWaka Notify Me]', { email, eventName, eventSlug, at: new Date().toISOString() })
    return NextResponse.json({ ok: true })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const toEmail   = process.env.CONTACT_TO_EMAIL  ?? 'info@myafrowaka.com'

    await resend.emails.send({
      from:    `MyAfroWaka <${fromEmail}>`,
      to:      [toEmail],
      replyTo: email,
      subject: `[Notify Me] ${escapeHtml(eventName)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 20px;color:#1A1813">New "notify me" request</h2>
          <p style="font-size:14px;color:#1A1813">A visitor wants to be notified once real dates are announced for:</p>
          <p style="font-size:16px;color:#1A1813"><strong>${escapeHtml(eventName)}</strong> (/events/${escapeHtml(eventSlug)})</p>
          <p style="font-size:14px;color:#1A1813">Email: <a href="mailto:${escapeHtml(email)}" style="color:#A22E29">${escapeHtml(email)}</a></p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Notify Me] Resend error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
