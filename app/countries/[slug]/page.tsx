import { redirect } from 'next/navigation'

export default async function CountryRedirect(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  redirect(`/destinations/${slug}`)
}
