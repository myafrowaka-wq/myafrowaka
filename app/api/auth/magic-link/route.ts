import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createMagicLinkToken } from '@/lib/magicLink'
import { safeRedirect } from '@/lib/safeRedirect'

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

const resendKey  = process.env.RESEND_API_KEY ?? ''
const resendFrom = process.env.RESEND_FROM_EMAIL ?? ''
const hasResend  = Boolean(
  resendKey && resendFrom &&
  !resendKey.startsWith('REPLACE_WITH') && !resendFrom.startsWith('REPLACE_WITH')
)

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
    try {
      const resend = new Resend(resendKey)
      await resend.emails.send({
        from: resendFrom,
        to: email,
        subject: 'Your MyAfroWaka sign-in link',
        text: `Sign in to MyAfroWaka:\n\n${link}\n\nThis link expires in 15 minutes and only works once. If you didn't request this, ignore this email.`,
        html: `<p>Sign in to MyAfroWaka:</p><p><a href="${link}">${link}</a></p><p>This link expires in 15 minutes and only works once. If you didn't request this, ignore this email.</p>`,
      })
    } catch (err) {
      console.error('[Magic Link] Resend send failed:', err)
      return NextResponse.json({ error: 'Could not send the email. Please try again.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  // No real Resend key configured — log it and hand it back for local testing.
  console.log(`[Magic Link] No RESEND_API_KEY configured. Sign-in link for ${email}:\n${link}`)
  return NextResponse.json({ ok: true, devLink: link })
}
