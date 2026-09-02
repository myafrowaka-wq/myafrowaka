// Session 5.1 — the double opt-in confirmation email. Same table-based HTML
// email shape and real brand palette as lib/inviteEmail.ts (email clients
// strip <style> tags, so this can't reuse the site's own component CSS).

const INK = '#1A1813'
const CRIMSON = '#A22E29'
const CREAM = '#F7F2E9'
const CHARCOAL = '#29251A'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface ConfirmEmailInput {
  confirmUrl: string
  unsubscribeUrl: string
  origin: string
}

export function buildConfirmEmail(input: ConfirmEmailInput): { subject: string; text: string; html: string } {
  // Both URLs are built server-side from the request's Origin header (see
  // the subscribe route) — a browser controls that header but a raw HTTP
  // client doesn't have to, and anyone can submit any email address to a
  // public signup form, so the recipient isn't necessarily the requester.
  // Escaped for the same reason every field in lib/inviteEmail.ts already
  // is.
  const safeConfirmUrl = escapeHtml(input.confirmUrl)
  const safeUnsubscribeUrl = escapeHtml(input.unsubscribeUrl)
  // `origin` feeds the logo <img src> below — it's the exact same
  // request-Origin-header-derived value as confirmUrl/unsubscribeUrl (see
  // the subscribe route), so it needs the same escaping. Missing this
  // would mean a spoofed Origin header couldn't just alter a link, it
  // could break out of an attribute entirely and inject arbitrary markup
  // into an email sent to someone else's inbox.
  const safeOrigin = escapeHtml(input.origin)
  const subject = 'Confirm your MyAfroWaka subscription'

  // The unsubscribe link belongs here too, not just in a future newsletter
  // send — /newsletter's own copy promises "every email carries a working
  // unsubscribe link," and this is the first real email a subscriber gets.
  // A confirmation email nobody's confirmed yet is arguably exempt from
  // that requirement in most jurisdictions, but promising it everywhere
  // and then leaving it out of the one email built so far isn't a promise
  // worth keeping selectively.
  const text = [
    'One more step: confirm you want Africa travel guides, verified events, and hidden gems in your inbox.',
    `\nConfirm your subscription: ${input.confirmUrl}`,
    '\nThis link expires in 48 hours. If you did not request this, you can ignore this email: you will not be subscribed unless you click the link.',
    `\nDidn't ask for this, or changed your mind already? Unsubscribe: ${input.unsubscribeUrl}`,
  ].join('\n')

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background-color:${INK};padding:32px 40px;text-align:center;">
          <img src="${safeOrigin}/logo-white.png" alt="MyAfroWaka" width="180" style="display:block;margin:0 auto;" />
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${CRIMSON};font-weight:bold;">
            One more step
          </p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${CHARCOAL};">
            Confirm your subscription
          </h1>
          <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#6b6455;">
            Click below and you're on the list for real African travel guides, verified events, and the places search engines haven't ruined yet. No spam, and you can leave any time.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="background-color:${CRIMSON};border-radius:8px;">
              <a href="${safeConfirmUrl}" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:${CREAM};text-decoration:none;">
                Confirm subscription
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#9a9284;">
            This link expires in 48 hours. If you didn't request this, just ignore it: you won't be subscribed unless you click the button above.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px;border-top:1px solid #ece5d5;">
          <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#9a9284;">
            MyAfroWaka &mdash; Africa, explained by Africans.
          </p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9a9284;">
            Didn't ask for this? <a href="${safeUnsubscribeUrl}" style="color:#9a9284;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`.trim()

  return { subject, text, html }
}
