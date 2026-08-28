import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import {
  TRIP_PLANNER_COUNTRIES_QUERY,
  ALL_ATTRACTIONS_QUERY,
  ALL_EVENTS_QUERY,
} from '@/sanity/lib/queries'
import { TripPlanner, type PlannerCountry, type PlannerAttraction, type PlannerEvent } from '@/components/TripPlanner'

// Session 4.2 — "The trip planner, version 2." Rebuilt from an intent-
// capture form (destination/dates/travelers/budget → redirect to /search)
// into a real day-by-day itinerary builder: pick a country, see its real
// overview (Session 2.2 data), choose dates, see what verified events are
// actually happening in that country during those dates (the Phase 3
// events database — the differentiator the plan calls out by name), add
// attractions and events to specific days, save it, name it.
//
// This stays a Server Component purely to fetch once; all the interactive
// state (including the signed-out localStorage draft) lives in the client
// TripPlanner below it. Fetches everything published up front rather than
// a query per country — at 47 countries / 48 published attractions / 0
// events today this is a small, single round trip, not per-keystroke
// Sanity calls as someone browses countries.

export const metadata: Metadata = {
  title: 'Plan Your Trip – MyAfroWaka',
  description: 'Build a real day-by-day Africa itinerary — pick a country, see what events are happening while you\'re there, add attractions, save it.',
}

export default async function PlanATripPage() {
  const [countries, attractions, events] = await Promise.all([
    client.fetch<PlannerCountry[]>(TRIP_PLANNER_COUNTRIES_QUERY),
    client.fetch<PlannerAttraction[]>(ALL_ATTRACTIONS_QUERY),
    client.fetch<PlannerEvent[]>(ALL_EVENTS_QUERY),
  ])

  return <TripPlanner countries={countries} attractions={attractions} events={events} />
}
