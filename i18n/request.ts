import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED = ['en', 'fr', 'pt'] as const
type Locale = typeof SUPPORTED[number]

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value ?? 'en'
  const locale: Locale = (SUPPORTED as readonly string[]).includes(raw) ? (raw as Locale) : 'en'

  const messagesModule =
    locale === 'fr' ? await import('../messages/fr.json') :
    locale === 'pt' ? await import('../messages/pt.json') :
                      await import('../messages/en.json')

  return {
    locale,
    messages: messagesModule.default,
  }
})
