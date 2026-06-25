import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// GET — list saved attractions for the signed-in user
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const saved = await writeClient.fetch<{ _id: string; attractionSlug: string; savedAt: string }[]>(
    `*[_type == "savedAttraction" && userId == $uid] | order(savedAt desc) { _id, attractionSlug, savedAt }`,
    { uid: session.user.id }
  )
  return NextResponse.json({ saved })
}

// POST — save an attraction
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await req.json() as { slug: string }
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const existing = await writeClient.fetch<{ _id: string }[]>(
    `*[_type == "savedAttraction" && userId == $uid && attractionSlug == $slug][0..0]{ _id }`,
    { uid: session.user.id, slug }
  )
  if (existing.length > 0) return NextResponse.json({ ok: true, alreadySaved: true })

  await writeClient.create({
    _type: 'savedAttraction',
    userId: session.user.id,
    userEmail: session.user.email ?? '',
    attractionSlug: slug,
    savedAt: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true })
}

// DELETE — unsave an attraction
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await req.json() as { slug: string }
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const docs = await writeClient.fetch<{ _id: string }[]>(
    `*[_type == "savedAttraction" && userId == $uid && attractionSlug == $slug]{ _id }`,
    { uid: session.user.id, slug }
  )
  for (const doc of docs) await writeClient.delete(doc._id)
  return NextResponse.json({ ok: true })
}
