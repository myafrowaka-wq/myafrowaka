// Session 3.3 — "Add to Google Calendar, Apple Calendar, download .ics."
//
// Deliberately gated by the same rule as lib/eventDateDisplay.ts: these
// only exist for an event whose date is dateType "Fixed" AND
// verificationStatus "Verified". Generating a calendar file from an
// estimated or unconfirmed date would be the exact fabrication the whole
// events product exists to refuse — a calendar invite is, if anything, a
// stronger claim of fact than text on a page, since it puts a specific
// date directly onto a visitor's own calendar.

export interface CalendarEventFields {
  name: string
  dateType?: string
  startDate?: string
  endDate?: string
  verificationStatus?: string
  venue?: string
  city?: string
  country?: string
  shortDescription?: string
  officialEventUrl?: string
}

// Deliberately its own minimal shape rather than CalendarEventFields — the
// confirmation check only ever needs three fields, and callers with a
// richer event object (whose city/country are Sanity references, not
// plain strings) shouldn't have to reshape the whole thing just to ask
// "is this date real?"
export interface DateConfirmationFields {
  dateType?: string
  startDate?: string
  verificationStatus?: string
}

export function hasConfirmedDate(event: DateConfirmationFields): boolean {
  return event.dateType === 'Fixed' && event.verificationStatus === 'Verified' && !!event.startDate
}

function toICSDate(iso: string): string {
  return iso.replace(/-/g, '')
}

// All-day event date ranges in iCalendar are exclusive on DTEND, so a
// single-day event needs DTEND = the day after DTSTART, and a multi-day
// event's real last day needs the same +1 treatment.
//
// Pure UTC arithmetic, deliberately — `new Date(iso + 'T00:00:00')` parses
// as *local* midnight, and round-tripping that through `.toISOString()`
// (always UTC) silently rolls the date back a day for anyone in a
// UTC-positive timezone. Found live: a 15-17 March event was producing a
// Google Calendar link ending 17 March instead of 18. Date.UTC never
// touches the local clock, so this can't drift with the server's timezone.
function nextDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return next.toISOString().slice(0, 10)
}

function locationString(event: CalendarEventFields): string {
  return [event.venue, event.city, event.country].filter(Boolean).join(', ')
}

function escapeICSText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function buildGoogleCalendarUrl(event: CalendarEventFields): string | null {
  if (!hasConfirmedDate(event) || !event.startDate) return null
  const start = toICSDate(event.startDate)
  const end = toICSDate(nextDay(event.endDate ?? event.startDate))
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${start}/${end}`,
    details: [event.shortDescription, event.officialEventUrl].filter(Boolean).join('\n\n'),
    location: locationString(event),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** A real .ics file, downloadable via a plain <a download> link — this is a
 *  live site, not a sandboxed preview, so a standard blob/data URI download
 *  works normally in the visitor's own browser. */
export function buildICSDataUrl(event: CalendarEventFields): string | null {
  if (!hasConfirmedDate(event) || !event.startDate) return null
  const start = toICSDate(event.startDate)
  const end = toICSDate(nextDay(event.endDate ?? event.startDate))
  const now = toICSDate(new Date().toISOString().slice(0, 10)) + 'T000000Z'
  const uid = `${start}-${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@myafrowaka.com`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyAfroWaka//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeICSText(event.name)}`,
    event.shortDescription ? `DESCRIPTION:${escapeICSText(event.shortDescription)}` : '',
    locationString(event) ? `LOCATION:${escapeICSText(locationString(event))}` : '',
    event.officialEventUrl ? `URL:${event.officialEventUrl}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)

  // CRLF line endings are required by the iCalendar spec (RFC 5545).
  const ics = lines.join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
