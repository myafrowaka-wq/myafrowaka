// Batch 3 (2026-09-06 UX overhaul) — flight-price scaffolding.
//
// The owner asked for "suggested airlines and the cheapest rate" inside
// the trip planner. Actually pricing flights needs a real data provider
// account (Travelpayouts is the one the research pass landed on — a
// standard, no-cost-to-join affiliate/data API used by most independent
// travel sites for exactly this). Signing up for that account is real
// account creation on a third-party service, which is on Claude's own
// permanently-prohibited action list regardless of any pre-authorization
// — see the owner report for this batch. This file is the code side of
// the "graceful degradation" half of that split: written against
// Travelpayouts' documented, stable /v1/prices/cheap endpoint shape
// (api.travelpayouts.com, checked 6 Sep 2026), gated by the same
// feature-detection pattern as auth.ts's hasGoogle and the newsletter
// flow's Resend key — so the moment a real token is added to the
// environment, this activates with no other code changes. Never
// live-tested against a real token; verify the response shape against a
// real account before fully trusting it in production.
export const hasFlightPricing = Boolean(
  process.env.TRAVELPAYOUTS_TOKEN &&
  process.env.TRAVELPAYOUTS_MARKER &&
  !process.env.TRAVELPAYOUTS_TOKEN.startsWith('REPLACE_WITH')
)

export interface CheapFlightResult {
  price: number
  currency: 'USD'
  airline: string
  departDate: string
  returnDate?: string
}

/** Cheapest fare found for a route in a given month. Returns null on any
 *  failure (no token configured, route not found, API error) — callers
 *  render the honest "not available" state rather than guessing. */
export async function getCheapestFlight(
  originIATA: string,
  destinationIATA: string,
  departMonth: string, // yyyy-mm
): Promise<CheapFlightResult | null> {
  if (!hasFlightPricing) return null
  const token = process.env.TRAVELPAYOUTS_TOKEN!

  try {
    const url = new URL('https://api.travelpayouts.com/v1/prices/cheap')
    url.searchParams.set('origin', originIATA.toUpperCase())
    url.searchParams.set('destination', destinationIATA.toUpperCase())
    url.searchParams.set('depart_date', departMonth)
    url.searchParams.set('token', token)

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json() as {
      success?: boolean
      data?: Record<string, Record<string, { price: number; airline: string; departure_at: string; return_at?: string }>>
    }
    if (!data.success || !data.data) return null

    // Response is keyed by destination IATA, then by number of stops
    // ("0", "1", ...). Take the cheapest entry across all of them.
    const byStops = data.data[destinationIATA.toUpperCase()]
    if (!byStops) return null
    const cheapest = Object.values(byStops).sort((a, b) => a.price - b.price)[0]
    if (!cheapest) return null

    return {
      price: cheapest.price,
      currency: 'USD',
      airline: cheapest.airline,
      departDate: cheapest.departure_at,
      returnDate: cheapest.return_at,
    }
  } catch {
    return null
  }
}
