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

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trips = await writeClient.fetch<{
    _id: string
    destination: string
    dates?: { from?: string; to?: string }
    travelers?: string
    budget?: string
    interests?: string[]
    savedAt: string
  }[]>(
    `*[_type == "savedTrip" && userId == $uid] | order(savedAt desc) {
      _id, destination, dates, travelers, budget, interests, savedAt
    }`,
    { uid: session.user.id }
  ).catch(() => [])

  return NextResponse.json({ trips })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    destination?: string
    from?: string
    to?: string
    travelers?: string
    budget?: string
    interests?: string[]
  }

  if (!body.destination?.trim()) {
    return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
  }

  await writeClient.create({
    _type: 'savedTrip',
    userId: session.user.id,
    userEmail: session.user.email ?? '',
    destination: body.destination.trim(),
    dates: { from: body.from ?? '', to: body.to ?? '' },
    travelers: body.travelers ?? '',
    budget: body.budget ?? '',
    interests: body.interests ?? [],
    savedAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json() as { id: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const doc = await writeClient.fetch<{ _id: string; userId: string } | null>(
    `*[_id == $id][0]{ _id, userId }`,
    { id }
  )

  if (!doc || doc.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await writeClient.delete(doc._id)
  return NextResponse.json({ ok: true })
}
