import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/studio/',
          '/admin/',
          '/dashboard/',
          '/api/',
          '/search',
          '/login',
          '/style-guide',
        ],
      },
    ],
    sitemap: 'https://myafrowaka.com/sitemap.xml',
  }
}
