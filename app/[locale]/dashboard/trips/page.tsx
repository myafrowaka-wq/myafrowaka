import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export default async function OldTripsPage() {
  redirect({ href: '/user-dashboard#trips', locale: await getLocale() })
}
