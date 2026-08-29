import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export default async function CountryRedirect(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  redirect({ href: `/destinations/${slug}`, locale: await getLocale() })
}
