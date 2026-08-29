import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export default async function OldDashboardPage() {
  redirect({ href: '/user-dashboard', locale: await getLocale() })
}
