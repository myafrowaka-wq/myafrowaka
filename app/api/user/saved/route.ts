import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'
import { normalizeCollectionName, DEFAULT_COLLECTION } from '@/lib/collections'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// GET — list saved attractions for the signed-in user, grouped by
// collection. Batch 1 — collectionName is a real field now, but every
// record saved before this change has none, so `coalesce` reads those as
// "General" rather than needing a one-time migration script.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const saved = await writeClient.fetch<{ _id: string; attractionSlug: string; savedAt: string; collectionName: string }[]>(
    `*[_type == "savedAttraction" && userId == $uid] | order(savedAt desc) {
      _id, attractionSlug, savedAt, "collectionName": coalesce(collectionName, "${DEFAULT_COLLECTION}")
    }`,
    { uid: session.user.id }
  )
  return NextResponse.json({ saved })
}

// POST — save an attraction to a collection (defaults to General).
// Batch 1 — the same attraction can now live in more than one collection
// at once (matches Pinterest boards / Kayak Wishlist, not a single
// yes/no "saved" flag), so the duplicate check is scoped to the specific
// (user, attraction, collection) triple, not just (user, attraction).
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { slug: string; collectionName?: string }
  const { slug } = body
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  const collectionName = normalizeCollectionName(body.collectionName)

  const existing = await writeClient.fetch<{ _id: string }[]>(
    `*[_type == "savedAttraction" && userId == $uid && attractionSlug == $slug && coalesce(collectionName, "${DEFAULT_COLLECTION}") == $collectionName][0..0]{ _id }`,
    { uid: session.user.id, slug, collectionName }
  )
  if (existing.length > 0) return NextResponse.json({ ok: true, alreadySaved: true })

  await writeClient.create({
    _type: 'savedAttraction',
    userId: session.user.id,
    userEmail: session.user.email ?? '',
    attractionSlug: slug,
    collectionName,
    savedAt: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true })
}

// DELETE — unsave an attraction. Pass collectionName to remove it from
// just that one collection; omit it to remove every copy of that
// attraction across all of this user's collections (the original
// behaviour, still used by the simple heart-toggle Save button).
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug, collectionName } = await req.json() as { slug: string; collectionName?: string }
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const query = collectionName
    ? `*[_type == "savedAttraction" && userId == $uid && attractionSlug == $slug && coalesce(collectionName, "${DEFAULT_COLLECTION}") == $collectionName]{ _id }`
    : `*[_type == "savedAttraction" && userId == $uid && attractionSlug == $slug]{ _id }`
  const docs = await writeClient.fetch<{ _id: string }[]>(query, { uid: session.user.id, slug, collectionName: normalizeCollectionName(collectionName) })
  for (const doc of docs) await writeClient.delete(doc._id)
  return NextResponse.json({ ok: true })
}
