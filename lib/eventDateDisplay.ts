// Session 3.2 — the actual frontend implementation of the plan's central
// rule for events: "An unverified date never displays as a fact." Every
// place on the site that shows an event's timing (the card grid here, the
// event template in Session 3.3) should go through this function rather
// than reading startDate/endDate directly, so the rule can't quietly be
// bypassed by a component that reaches straight for the raw field.

export interface EventDateFields {
  dateType?: string
  startDate?: string
  endDate?: string
  estimatedTiming?: string
  verificationStatus?: string
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateRange(start: string, end?: string): string {
  if (!end || end === start) return formatDate(start)
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  // Same month and year: "15–18 August 2027". Otherwise two full dates.
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    const day = s.toLocaleDateString('en-GB', { day: 'numeric' })
    return `${day}–${formatDate(end)}`
  }
  return `${formatDate(start)} – ${formatDate(end)}`
}

/**
 * Returns the honest display string for an event's timing, and whether
 * that string represents a confirmed fact or an estimate. A caller can use
 * `isConfirmedFact` to decide styling (e.g. only a confirmed date gets the
 * plain "date" treatment; an estimate always carries visual signals that
 * it isn't final) but should never independently re-derive a date string
 * from the raw fields.
 */
export function eventDateDisplay(event: EventDateFields): { text: string; isConfirmedFact: boolean } {
  if (event.verificationStatus === 'Cancelled or postponed') {
    return { text: 'Cancelled or postponed', isConfirmedFact: false }
  }

  // Only a Fixed-calendar event with an actually-Verified status may show
  // a real date as fact. Everything else — including a Fixed event whose
  // date simply hasn't been verified yet — falls through to the estimate.
  if (event.dateType === 'Fixed' && event.verificationStatus === 'Verified' && event.startDate) {
    return { text: formatDateRange(event.startDate, event.endDate), isConfirmedFact: true }
  }

  if (event.estimatedTiming) {
    return { text: event.estimatedTiming, isConfirmedFact: false }
  }

  if (event.verificationStatus === 'Annual, dates vary') {
    return { text: 'Annual, dates vary each year', isConfirmedFact: false }
  }

  return { text: 'Date to be confirmed', isConfirmedFact: false }
}
