import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function GET() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'admin' && role !== 'contributor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const attractions = await readClient.fetch(`
    *[_type == "attraction"] | order(contentStatus asc, name asc) [0..599] {
      _id,
      name,
      "slug": slug.current,
      contentStatus,
      continentRegion,
      metaTitle,
      metaDescription,
      focusKeyword,
      lastVerifiedDate,
      "hasBody": defined(articleBody) && length(articleBody) > 0,
      "country": country->{ name }
    }
  `)

  return NextResponse.json({ attractions })
}
