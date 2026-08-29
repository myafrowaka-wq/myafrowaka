import { defineRouting } from 'next-intl/routing'

// Session 5.3 — "Move to proper URL-based languages: myafrowaka.com/fr/..."
// localePrefix 'as-needed' means English (the default) keeps today's exact
// URLs — /attractions/foo stays /attractions/foo, nothing already indexed
// or bookmarked breaks — while French and Portuguese get real, crawlable
// prefixes: /fr/attractions/foo, /pt/attractions/foo. This is the one
// source of truth for the three supported locales; i18n/navigation.ts and
// middleware.ts both read it rather than repeating the list.
export const routing = defineRouting({
  locales: ['en', 'fr', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export type AppLocale = (typeof routing.locales)[number]
