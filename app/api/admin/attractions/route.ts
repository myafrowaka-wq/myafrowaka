import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'
import { atLeast } from '@/lib/roles'
import type { UserRole } from '@/types/next-auth'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Contributor and up may touch the pipeline; only Contributor itself is then
// restricted below to submitting for review rather than publishing directly.
function requireAdmin(role?: string) {
  return atLeast((role ?? 'visitor') as UserRole, 'contributor')
}

// GET — fetch all attractions with pipeline fields
export async function GET() {
  const session = await auth()
  if (!requireAdmin(session?.user?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const attractions = await writeClient.fetch<{
    _id: string
    name: string
    slug: string
    contentStatus: string
    continentRegion?: string
    lastVerifiedDate?: string
    country?: { name: string }
    type?: string[]
  }[]>(`
    *[_type == "attraction"] | order(contentStatus asc, name asc) [0..499] {
      _id,
      name,
      "slug": slug.current,
      contentStatus,
      continentRegion,
      lastVerifiedDate,
      country->{ name },
      type
    }
  `)

  return NextResponse.json({ attractions })
}

// PATCH — change contentStatus of an attraction
export async function PATCH(req: Request) {
  const session = await auth()
  if (!requireAdmin(session?.user?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status } = await req.json() as { id: string; status: string }
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

  const VALID_STATUSES = ['Draft', 'Verified', 'Needs Update', 'Incomplete', 'Published', 'Archived']
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Contributors can only move to Verified (submit for review)
  if (session?.user?.role === 'contributor' && status !== 'Verified') {
    return NextResponse.json({ error: 'Contributors can only submit for review' }, { status: 403 })
  }

  await writeClient.patch(id).set({ contentStatus: status }).commit()
  return NextResponse.json({ ok: true })
}
