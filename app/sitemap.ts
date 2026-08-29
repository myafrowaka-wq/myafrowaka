import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { EVENT_MONTHS, matchesMonth, toSlug } from '@/lib/eventFilters'
import { hreflangAlternates } from '@/lib/hreflang'

const BASE = 'https://myafrowaka.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ─────────────────────────────────────────────────────────
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: now, changeFrequency: 'daily',   priority: 1.0, alternates: { languages: hreflangAlternates(BASE) } },
    { url: `${BASE}/blog`,        lastModified: now, changeFrequency: 'daily',   priority: 0.9, alternates: { languages: hreflangAlternates(`${BASE}/blog`) } },
    { url: `${BASE}/attractions`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.9, alternates: { languages: hreflangAlternates(`${BASE}/attractions`) } },
    { url: `${BASE}/events`,   lastModified: now, changeFrequency: 'daily',   priority: 0.9, alternates: { languages: hreflangAlternates(`${BASE}/events`) } },
    { url: `${BASE}/events/experience-score`, lastModified: now, changeFrequency: 'monthly', priority: 0.5, alternates: { languages: hreflangAlternates(`${BASE}/events/experience-score`) } },
    { url: `${BASE}/guides`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.85, alternates: { languages: hreflangAlternates(`${BASE}/guides`) } },
    { url: `${BASE}/about`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5, alternates: { languages: hreflangAlternates(`${BASE}/about`) } },
    { url: `${BASE}/contact`,  lastModified: now, changeFrequency: 'monthly', priority: 0.4, alternates: { languages: hreflangAlternates(`${BASE}/contact`) } },
    { url: `${BASE}/privacy`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.2, alternates: { languages: hreflangAlternates(`${BASE}/privacy`) } },
    { url: `${BASE}/terms`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.2, alternates: { languages: hreflangAlternates(`${BASE}/terms`) } },
  ]

  // ── Attractions ───────────────────────────────────────────────────────────
  const attractions = await client.fetch<{ slug: string; lastVerifiedDate?: string }[]>(`
    *[_type == "attraction" && contentStatus == "Published"]{ "slug": slug.current, lastVerifiedDate }
  `).catch(() => [])

  const attractionEntries: MetadataRoute.Sitemap = attractions.map(a => ({
    url: `${BASE}/attractions/${a.slug}`,
    lastModified: a.lastVerifiedDate ? new Date(a.lastVerifiedDate) : now,
    changeFrequency: 'monthly',
    priority: 0.8,
    alternates: { languages: hreflangAlternates(`${BASE}/attractions/${a.slug}`) },
  }))

  // ── Blog posts ────────────────────────────────────────────────────────────
  const posts = await client.fetch<{ slug: string; publishedAt?: string }[]>(`
    *[_type == "post" && contentStatus == "Published"]{ "slug": slug.current, publishedAt }
  `).catch(() => [])

  const postEntries: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: { languages: hreflangAlternates(`${BASE}/blog/${p.slug}`) },
  }))

  // ── Events (Session 3.3 built the page template; Session 3.4 the six
  // discovery doors — country/region/month/category/collections — all
  // pulling from this same query, "one database, many doors in") ─────────
  const events = await client.fetch<{
    slug: string; verificationDate?: string; category?: string
    country?: { slug?: string; continentRegion?: string }
    startDate?: string; estimatedTiming?: string
  }[]>(`
    *[_type == "event" && contentStatus == "Published"]{
      "slug": slug.current, verificationDate, category, startDate, estimatedTiming,
      "country": country->{ "slug": slug.current, continentRegion }
    }
  `).catch(() => [])

  const eventCountrySlugs = [...new Set(events.map(e => e.country?.slug).filter((s): s is string => !!s))]
  const eventRegions = [...new Set(events.map(e => e.country?.continentRegion).filter((r): r is string => !!r))]
  const eventCategoriesUsed = [...new Set(events.map(e => e.category).filter((c): c is string => !!c))]
  const eventMonthsUsed = EVENT_MONTHS.filter(m => events.some(e => matchesMonth(e, m)))

  const eventCountryEntries: MetadataRoute.Sitemap = eventCountrySlugs.map(slug => ({
    url: `${BASE}/events/country/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.65,
    alternates: { languages: hreflangAlternates(`${BASE}/events/country/${slug}`) },
  }))
  const eventRegionEntries: MetadataRoute.Sitemap = eventRegions.map(r => ({
    url: `${BASE}/events/region/${toSlug(r)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6,
    alternates: { languages: hreflangAlternates(`${BASE}/events/region/${toSlug(r)}`) },
  }))
  const eventCategoryEntries: MetadataRoute.Sitemap = eventCategoriesUsed.map(c => ({
    url: `${BASE}/events/category/${toSlug(c)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6,
    alternates: { languages: hreflangAlternates(`${BASE}/events/category/${toSlug(c)}`) },
  }))
  const eventMonthEntries: MetadataRoute.Sitemap = eventMonthsUsed.map(m => ({
    url: `${BASE}/events/month/${toSlug(m)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6,
    alternates: { languages: hreflangAlternates(`${BASE}/events/month/${toSlug(m)}`) },
  }))

  const eventCollections = await client.fetch<{ slug: string }[]>(`
    *[_type == "eventCollection" && contentStatus == "Published"]{ "slug": slug.current }
  `).catch(() => [])
  const eventCollectionEntries: MetadataRoute.Sitemap = eventCollections.map(c => ({
    url: `${BASE}/events/collections/${c.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6,
    alternates: { languages: hreflangAlternates(`${BASE}/events/collections/${c.slug}`) },
  }))

  const eventEntries: MetadataRoute.Sitemap = events.map(e => ({
    url: `${BASE}/events/${e.slug}`,
    lastModified: e.verificationDate ? new Date(e.verificationDate) : now,
    changeFrequency: 'weekly',
    priority: 0.75,
    alternates: { languages: hreflangAlternates(`${BASE}/events/${e.slug}`) },
  }))

  // ── Destination (country) pages ───────────────────────────────────────────
  // Only countries with at least one published attraction — an empty country
  // page submitted to Google is thin content with nothing for a crawler to index.
  const countries = await client.fetch<{ slug: string }[]>(`
    *[_type == "country" && count(*[_type == "attraction" && references(^._id) && contentStatus == "Published"]) > 0]{ "slug": slug.current }
  `).catch(() => [])

  const countryEntries: MetadataRoute.Sitemap = countries.map(c => ({
    url: `${BASE}/destinations/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
    alternates: { languages: hreflangAlternates(`${BASE}/destinations/${c.slug}`) },
  }))

  // ── City pages ────────────────────────────────────────────────────────────
  // Same rule as countries: only cities with at least one published attraction.
  const cities = await client.fetch<{ slug: string }[]>(`
    *[_type == "city" && count(*[_type == "attraction" && references(^._id) && contentStatus == "Published"]) > 0]{ "slug": slug.current }
  `).catch(() => [])

  const cityEntries: MetadataRoute.Sitemap = cities.map(c => ({
    url: `${BASE}/cities/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
    alternates: { languages: hreflangAlternates(`${BASE}/cities/${c.slug}`) },
  }))

  // ── Authors ───────────────────────────────────────────────────────────────
  const authors = await client.fetch<{ slug: string }[]>(`
    *[_type == "author"]{ "slug": slug.current }
  `).catch(() => [])

  const authorEntries: MetadataRoute.Sitemap = authors.map(a => ({
    url: `${BASE}/authors/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
    alternates: { languages: hreflangAlternates(`${BASE}/authors/${a.slug}`) },
  }))

  // ── Guide (editorial pillar) pages ───────────────────────────────────────
  const guides = await client.fetch<{ slug: string }[]>(`
    *[_type == "editorialPillar" && contentStatus == "Published"]{ "slug": slug.current }
  `).catch(() => [])

  const guideEntries: MetadataRoute.Sitemap = guides.map(g => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
    alternates: { languages: hreflangAlternates(`${BASE}/guides/${g.slug}`) },
  }))

  return [
    ...statics, ...attractionEntries, ...eventEntries,
    ...eventCountryEntries, ...eventRegionEntries, ...eventCategoryEntries, ...eventMonthEntries, ...eventCollectionEntries,
    ...postEntries, ...authorEntries, ...guideEntries, ...countryEntries, ...cityEntries,
  ]
}
