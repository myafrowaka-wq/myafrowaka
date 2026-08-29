// Session 4.3 — "They get a branded email showing the itinerary." Built as
// a plain table-based HTML email (email clients strip <style> tags and
// have inconsistent CSS support, so this can't just reuse the site's own
// component styles) using the real brand palette from app/globals.css —
// the same colors app/opengraph-image.tsx already uses for the site's own
// social card, so this looks like it came from the same place that built
// the rest of the site rather than a generic email-tool template.

const INK     = '#1A1813'
const GOLD    = '#D5A942'
const CRIMSON = '#A22E29'
const CREAM   = '#F7F2E9'
const CHARCOAL = '#29251A'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface InviteEmailInput {
  inviterName: string
  tripName: string
  countryName: string
  from?: string
  to?: string
  note: string
  itemCount: number
  acceptUrl: string
  origin: string
}

function formatDateRange(from?: string, to?: string): string {
  if (!from || !to) return ''
  const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${fmt(from)} – ${fmt(to)}`
}

export function buildInviteEmail(input: InviteEmailInput): { subject: string; text: string; html: string } {
  const dateRange = formatDateRange(input.from, input.to)
  const subject = `${input.inviterName} invited you to plan ${input.tripName}`
  // acceptUrl is built server-side from the request's Origin header (see
  // the invite route), which a browser controls but a raw HTTP request
  // doesn't have to — a malicious trip owner scripting requests directly
  // could set it to arbitrary text and have it land, unescaped, in an
  // <a href> sent to someone else's inbox. Escaping it here means that
  // stops mattering regardless of how trustworthy the source turns out to
  // be, the same way any other field in this email already is.
  const safeAcceptUrl = escapeHtml(input.acceptUrl)
  // Session 5.1's second look-through — `origin` feeds the logo <img src>
  // below and comes from the exact same Origin-header source as acceptUrl.
  // It was overlooked when acceptUrl was escaped above: a spoofed Origin
  // header could break out of the src attribute and inject arbitrary
  // markup into an email sent to someone else's inbox, the same class of
  // gap acceptUrl's own escaping exists to close.
  const safeOrigin = escapeHtml(input.origin)

  const text = [
    `${input.inviterName} invited you to join a trip on MyAfroWaka: "${input.tripName}" in ${input.countryName}${dateRange ? ` (${dateRange})` : ''}.`,
    input.note ? `\n"${input.note}"\n` : '',
    input.itemCount > 0 ? `They've already added ${input.itemCount} item${input.itemCount !== 1 ? 's' : ''} to the itinerary.` : 'The itinerary is just getting started.',
    `\nSee the trip and join: ${input.acceptUrl}`,
    `\nThis invite link expires in 7 days.`,
  ].join('\n')

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background-color:${INK};padding:32px 40px;text-align:center;">
          <img src="${safeOrigin}/logo-white.png" alt="MyAfroWaka" width="180" style="display:block;margin:0 auto;" />
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px 8px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${CRIMSON};font-weight:bold;">
            You're invited to a trip
          </p>
          <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:${CHARCOAL};">
            ${escapeHtml(input.inviterName)} wants you along for<br/>${escapeHtml(input.tripName)}
          </h1>
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;color:${CHARCOAL};">
            <strong>${escapeHtml(input.countryName)}</strong>${dateRange ? ` &middot; ${dateRange}` : ''}
          </p>
          <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:15px;color:#6b6455;">
            ${input.itemCount > 0 ? `${input.itemCount} item${input.itemCount !== 1 ? 's' : ''} already on the itinerary.` : 'The itinerary is just getting started.'}
          </p>
          ${input.note ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="background-color:${CREAM};border-left:3px solid ${GOLD};padding:14px 18px;border-radius:4px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-style:italic;color:${CHARCOAL};">
                &ldquo;${escapeHtml(input.note)}&rdquo;
              </p>
            </td></tr>
          </table>` : ''}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background-color:${CRIMSON};border-radius:8px;">
              <a href="${safeAcceptUrl}" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:${CREAM};text-decoration:none;">
                See the trip
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:13px;color:#9a9284;">
            This invite link expires in 7 days. Joining is free and takes a moment.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px;border-top:1px solid #ece5d5;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9a9284;">
            MyAfroWaka &mdash; Africa, explained by Africans.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`.trim()

  return { subject, text, html }
}
