import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { createClient } from 'next-sanity'

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

interface SavedDoc {
  _id: string
  attractionSlug: string
  savedAt: string
}

interface AttractionSummary {
  name: string
  slug: { current: string }
  editorialSummary?: string
  continentRegion?: string
  country?: { name: string; slug: string }
  type?: string[]
}

export default async function SavedPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?next=/dashboard/saved')

  const saved = await readClient.fetch<SavedDoc[]>(
    `*[_type == "savedAttraction" && userId == $uid] | order(savedAt desc) { _id, attractionSlug, savedAt }`,
    { uid: session.user.id }
  )

  let attractions: AttractionSummary[] = []
  if (saved.length > 0) {
    const slugs = saved.map(s => s.attractionSlug)
    attractions = await client.fetch<AttractionSummary[]>(
      `*[_type == "attraction" && slug.current in $slugs] {
        name, slug, editorialSummary, continentRegion, type,
        country->{ name, slug }
      }`,
      { slugs }
    )
  }

  const attractionMap = Object.fromEntries(attractions.map(a => [a.slug.current, a]))

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-2">Dashboard</p>
        <h1 className="font-display font-extrabold text-charcoal dark-flip-text"
          style={{ fontSize: 'clamp(22px, 3vw, 34px)', letterSpacing: '-0.02em' }}>
          Saved Attractions
        </h1>
      </div>

      {saved.length === 0 ? (
        <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gold-400/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <p className="font-display font-bold text-[17px] text-charcoal dark-flip-text mb-2" style={{ letterSpacing: '-0.01em' }}>
            No saved attractions yet.
          </p>
          <p className="font-sans text-[13px] text-charcoal/45 dark-flip-muted mb-6 max-w-xs mx-auto">
            Browse attractions and tap the Save button to collect places you want to visit.
          </p>
          <Link href="/search"
            className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson/90 text-cream font-display font-bold text-[11px] uppercase tracking-[0.1em] px-6 py-3 rounded-full transition-all">
            Browse Attractions
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map(doc => {
            const a = attractionMap[doc.attractionSlug]
            if (!a) return null
            const savedDate = new Date(doc.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <div key={doc._id}
                className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl p-5 flex items-start justify-between gap-4 group hover:border-gold-300 transition-all">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {a.country && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-gold-600">{a.country.name}</span>
                    )}
                    {a.type && a.type[0] && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted">· {a.type[0]}</span>
                    )}
                  </div>
                  <Link href={`/attractions/${a.slug.current}`}
                    className="font-display font-bold text-[16px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors block mb-1"
                    style={{ letterSpacing: '-0.01em' }}>
                    {a.name}
                  </Link>
                  {a.editorialSummary && (
                    <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted line-clamp-2 leading-relaxed">
                      {a.editorialSummary}
                    </p>
                  )}
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/25 dark-flip-muted mt-2">
                    Saved {savedDate}
                  </p>
                </div>
                <Link href={`/attractions/${a.slug.current}`}
                  className="shrink-0 w-9 h-9 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/30 hover:text-crimson hover:border-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
