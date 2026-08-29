import { NextRequest, NextResponse } from 'next/server'
import { createMagicLinkToken } from '@/lib/magicLink'
import { safeRedirect } from '@/lib/safeRedirect'
import { hasResend, sendEmail } from '@/lib/resend'

// Session 4.1 — "Add email sign-in alongside Google, because plenty of your
// audience does not use Google accounts." This issues the magic link;
// auth.ts's Credentials provider validates it when the link is clicked.
//
// Honest fallback: RESEND_API_KEY doesn't exist in this environment yet
// (same gap Session 3.3 found for the newsletter). Rather than pretend the
// email sent, or silently do nothing, the real link is logged to the server
// console and — dev-only — returned straight in the response so the flow is
// genuinely usable while testing. Once a real key is set, `devLink` stops
// being included and a real email goes out instead.
//
// Session 4.3 — the Resend send itself moved to lib/resend.ts, shared with
// the trip-invite email, so the "is a real key configured" check can't
// drift between the two.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { email?: string; next?: string } | null
  const email = body?.email?.trim().toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const rawToken = await createMagicLinkToken(email)

  // Validated again on the way out at the verify step (Route Handlers get
  // their own untrusted query-string input) — this first pass just keeps a
  // malicious `next` out of the emailed link at all.
  const next = safeRedirect(body?.next, '/user-dashboard')
  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const link = `${origin}/api/auth/magic-link/verify?email=${encodeURIComponent(email)}&token=${rawToken}&next=${encodeURIComponent(next)}`

  if (hasResend) {
    // `link` is built from the request's Origin header, which a browser
    // controls but a raw HTTP request doesn't have to — and anyone can
    // request a magic link for any email address (that's the point of a
    // passwordless flow), so the sender and recipient aren't necessarily
    // the same person here. Escaping before it goes into HTML sent to
    // someone else's inbox means a spoofed Origin can't inject markup.
    const safeLink = link.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const result = await sendEmail({
      to: email,
      subject: 'Your MyAfroWaka sign-in link',
      text: `Sign in to MyAfroWaka:\n\n${link}\n\nThis link expires in 15 minutes and only works once. If you didn't request this, ignore this email.`,
      html: `<p>Sign in to MyAfroWaka:</p><p><a href="${safeLink}">${safeLink}</a></p><p>This link expires in 15 minutes and only works once. If you didn't request this, ignore this email.</p>`,
    })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // No real Resend key configured — log it and hand it back for local testing.
  console.log(`[Magic Link] No RESEND_API_KEY configured. Sign-in link for ${email}:\n${link}`)
  return NextResponse.json({ ok: true, devLink: link })
}
