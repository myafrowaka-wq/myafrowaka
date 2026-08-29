import { Resend } from 'resend'

// Session 4.3 — extracted out of app/api/auth/magic-link/route.ts (Session
// 4.1) so the invite feature's real branded email doesn't grow a second,
// independently-drifting copy of the same "is a real key configured"
// check and Resend call — the exact kind of duplication this codebase has
// already had to close more than once (ATTRACTION_IMAGES across 8 files in
// Session 2.4, EventCard/VerificationBadge in Session 3.4).
//
// Honest fallback stays the caller's job, not this file's: RESEND_API_KEY
// is still absent from .env.local (checked before building this), so
// every caller needs its own "log + hand back a dev link/preview" path —
// what that fallback looks like differs per feature (a sign-in link vs. a
// full HTML invite), so it isn't something to centralize here.

const resendKey  = process.env.RESEND_API_KEY ?? ''
const resendFrom = process.env.RESEND_FROM_EMAIL ?? ''

export const hasResend = Boolean(
  resendKey && resendFrom &&
  !resendKey.startsWith('REPLACE_WITH') && !resendFrom.startsWith('REPLACE_WITH')
)

export interface SendEmailInput {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasResend) return { ok: false, error: 'Resend is not configured.' }
  try {
    const resend = new Resend(resendKey)
    await resend.emails.send({ from: resendFrom, ...input })
    return { ok: true }
  } catch (err) {
    console.error('[Resend] send failed:', err)
    return { ok: false, error: 'Could not send the email. Please try again.' }
  }
}
