import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

const BASE = 'https://myafrowaka.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ─────────────────────────────────────────────────────────
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/blog`,     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
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

  // ── Destination (country) pages ───────────────────────────────────────────
  const countries = await client.fetch<{ slug: string }[]>(`
    *[_type == "country"]{ "slug": slug.current }
  `).catch(() => [])

  const countryEntries: MetadataRoute.Sitemap = countries.map(c => ({
    url: `${BASE}/destinations/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  // ── City pages ────────────────────────────────────────────────────────────
  const cities = await client.fetch<{ slug: string }[]>(`
    *[_type == "city"]{ "slug": slug.current }
  `).catch(() => [])

  const cityEntries: MetadataRoute.Sitemap = cities.map(c => ({
    url: `${BASE}/cities/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
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

  return [...statics, ...attractionEntries, ...postEntries, ...guideEntries, ...countryEntries, ...cityEntries]
}
