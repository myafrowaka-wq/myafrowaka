import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

// Session 5.3 — replaces the old cookie-read (`NEXT_LOCALE`) with the real
// thing: the locale is now part of the URL itself, resolved by
// middleware.ts and handed to every server component via the [locale]
// route segment. `requestLocale` is next-intl's async accessor for that
// resolved value — falling back to the default locale for anything
// outside the [locale] tree (api routes, or a locale segment somehow
// missing/invalid), same as before.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const messagesModule =
    locale === 'fr' ? await import('../messages/fr.json') :
    locale === 'pt' ? await import('../messages/pt.json') :
                      await import('../messages/en.json')

  return {
    locale,
    messages: messagesModule.default,
  }
})
