import { Suspense } from 'react'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_EVENTS_QUERY, ALL_COUNTRIES_QUERY } from '@/sanity/lib/queries'
import { EventsExplorer, type EventSummary, type CountryOption } from '@/components/EventsExplorer'
import { stockImage } from '@/lib/stockImageCredits'
import { hreflangAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: { absolute: 'African Events & Festivals – MyAfroWaka' }, // Session 6.2 — see app/[locale]/login/page.tsx's comment: opts out of the parent title.template so this doesn't render doubled.
  description:
    'Festivals, cultural celebrations, and dated happenings across Africa, verified against an official source before they go live. Search by country, region, month, category, or travel style.',
  alternates: { canonical: 'https://myafrowaka.com/events', languages: hreflangAlternates('https://myafrowaka.com/events') },
  openGraph: {
    title: 'African Events & Festivals – MyAfroWaka',
    description: 'Verified African events, not a guessed calendar.',
    url: 'https://myafrowaka.com/events',
    images: [stockImage('1531872036218-4e8a6828e339')],
  },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'African Events & Festivals',
  description: 'A verified calendar of festivals, cultural celebrations, and dated happenings across Africa.',
  url: 'https://myafrowaka.com/events',
}

export default async function EventsPage() {
  const [events, countries] = await Promise.all([
    client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => [] as EventSummary[]),
    client.fetch<CountryOption[]>(ALL_COUNTRIES_QUERY).catch(() => [] as CountryOption[]),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="h-10 bg-sand rounded-xl w-64 mb-6 animate-pulse"/>
          <div className="flex gap-8">
            <div className="hidden md:block w-72 h-96 bg-sand rounded-2xl animate-pulse shrink-0"/>
            <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-sand rounded-2xl h-44 animate-pulse"/>
              ))}
            </div>
          </div>
        </div>
      }>
        <EventsExplorer events={events} countries={countries} />
      </Suspense>
    </>
  )
}
