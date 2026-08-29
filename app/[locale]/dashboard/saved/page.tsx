import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export default async function OldSavedPage() {
  redirect({ href: '/user-dashboard#saved', locale: await getLocale() })
}
