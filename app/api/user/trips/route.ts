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

// Session 4.2 — rebuilt for the real day-by-day itinerary (see
// sanity/schemaTypes/savedTrip.ts). GET resolves each day's item
// references to real attraction/event data so DashTrips and the planner's
// "continue editing" view never have to make a second round trip.

interface TripItemIn { kind: 'attraction' | 'event'; slug: string }
interface TripDayIn { date: string; items: TripItemIn[] }

// GET — list the signed-in user's trips, itinerary resolved
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trips = await writeClient.fetch(
    `*[_type == "savedTrip" && userId == $uid] | order(updatedAt desc) {
      _id,
      name,
      "country": country->{ name, "slug": slug.current, countryCode },
      dates,
      "days": days[]{
        date,
        "items": items[]{
          note,
          "kind": item->_type,
          "name": item->name,
          "slug": item->slug.current
        }
      },
      createdAt,
      updatedAt
    }`,
    { uid: session.user.id }
  ).catch(() => [])

  return NextResponse.json({ trips })
}

// POST — save (create) a trip from the local draft
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    name?: string
    countrySlug?: string
    from?: string
    to?: string
    days?: TripDayIn[]
  } | null

  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const name = body.name?.trim()
  if (!name || name.length > 80) return NextResponse.json({ error: 'Name your trip before saving (80 characters max).' }, { status: 400 })
  if (!body.countrySlug) return NextResponse.json({ error: 'Choose a country first.' }, { status: 400 })

  const country = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "country" && slug.current == $slug][0]{ _id }`,
    { slug: body.countrySlug }
  )
  if (!country) return NextResponse.json({ error: 'Unknown country.' }, { status: 400 })

  // Resolve every (kind, slug) item reference to a real document _id.
  // Silently drops an item whose attraction/event no longer exists, was
  // unpublished since it was added, or was never published at all (the
  // Published filter matters here specifically because this is a direct
  // API call, not the picker UI — that only ever offers published items,
  // but a crafted request could otherwise reference an unpublished one by
  // guessing its slug) rather than failing the whole save.
  const days = body.days ?? []
  const allSlugs = Array.from(new Set(days.flatMap(d => d.items.map(i => i.slug))))
  const resolved = allSlugs.length > 0
    ? await writeClient.fetch<{ _id: string; _type: string; slug: string }[]>(
        `*[(_type == "attraction" || _type == "event") && contentStatus == "Published" && slug.current in $slugs]{ _id, _type, "slug": slug.current }`,
        { slugs: allSlugs }
      )
    : []
  const idByKindSlug = new Map(resolved.map(r => [`${r._type}:${r.slug}`, r._id]))

  const now = new Date().toISOString()
  const doc = await writeClient.create({
    _type: 'savedTrip',
    userId: session.user.id,
    userEmail: session.user.email ?? '',
    name,
    country: { _type: 'reference', _ref: country._id },
    dates: { from: body.from ?? '', to: body.to ?? '' },
    days: days.map(d => ({
      _type: 'tripDay',
      _key: d.date || Math.random().toString(36).slice(2),
      date: d.date,
      items: d.items
        .map(i => {
          const id = idByKindSlug.get(`${i.kind}:${i.slug}`)
          if (!id) return null
          return { _type: 'tripItem', _key: `${i.kind}-${i.slug}`, item: { _type: 'reference', _ref: id } }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    })),
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json({ ok: true, id: doc._id })
}

// DELETE — remove a saved trip
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json() as { id: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Pre-existing pattern carried over from the old version of this route —
  // matching by _id alone, with no _type filter, meant this endpoint could
  // delete *any* document the caller owns (their own userRole doc,
  // savedAttraction, etc.), not just a savedTrip, if its _id were passed
  // in. Scoped to the type this route actually owns.
  const doc = await writeClient.fetch<{ _id: string; userId: string } | null>(
    `*[_type == "savedTrip" && _id == $id][0]{ _id, userId }`,
    { id }
  )

  if (!doc || doc.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await writeClient.delete(doc._id)
  return NextResponse.json({ ok: true })
}
