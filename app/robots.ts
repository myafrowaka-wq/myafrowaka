import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myafrowaka.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/user-dashboard',
          '/dashboard',
          '/login',
          '/register',
          '/admin',
          '/studio',
          '/search',
          '/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
