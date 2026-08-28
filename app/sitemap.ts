import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

const BASE = 'https://myafrowaka.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ─────────────────────────────────────────────────────────
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/blog`,        lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/attractions`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/events`,   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/events/experience-score`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/guides`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/about`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${BASE}/contact`,  lastModified: now, changeFrequency: 'monthly', priority: 0.4  },
    { url: `${BASE}/privacy`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.2  },
    { url: `${BASE}/terms`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.2  },
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
  }))

  // ── Events (Session 3.3 built the page template; the country/region/
  // month/category/collections discovery paths are Session 3.4's job) ──────
  const events = await client.fetch<{ slug: string; verificationDate?: string }[]>(`
    *[_type == "event" && contentStatus == "Published"]{ "slug": slug.current, verificationDate }
  `).catch(() => [])

  const eventEntries: MetadataRoute.Sitemap = events.map(e => ({
    url: `${BASE}/events/${e.slug}`,
    lastModified: e.verificationDate ? new Date(e.verificationDate) : now,
    changeFrequency: 'weekly',
    priority: 0.75,
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
  }))

  return [...statics, ...attractionEntries, ...eventEntries, ...postEntries, ...authorEntries, ...guideEntries, ...countryEntries, ...cityEntries]
}
