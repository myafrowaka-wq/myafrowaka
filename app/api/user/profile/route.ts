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

const TRAVEL_STYLES = [
  'Solo Travelers', 'Couples', 'Families', 'Backpackers',
  'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
]

// PATCH — update profile fields (Session 4.1: name, home country, travel
// style, countries visited, languages — photo is its own route, photo/route.ts,
// since it needs to handle a file upload rather than JSON).
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as {
    name?: string
    homeCountryId?: string | null
    travelStyle?: string | null
    countriesVisitedIds?: string[]
    languages?: string[]
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const set: Record<string, unknown> = {}
  const unset: string[] = []

  if (body.name !== undefined) {
    const trimmed = body.name.trim()
    if (!trimmed || trimmed.length > 80) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }
    set.userName = trimmed
  }

  if (body.homeCountryId !== undefined) {
    if (body.homeCountryId) set.homeCountry = { _type: 'reference', _ref: body.homeCountryId }
    else unset.push('homeCountry')
  }

  if (body.travelStyle !== undefined) {
    if (body.travelStyle && !TRAVEL_STYLES.includes(body.travelStyle)) {
      return NextResponse.json({ error: 'Invalid travel style' }, { status: 400 })
    }
    if (body.travelStyle) set.travelStyle = body.travelStyle
    else unset.push('travelStyle')
  }

  if (body.countriesVisitedIds !== undefined) {
    if (body.countriesVisitedIds.length > 0) {
      set.countriesVisited = body.countriesVisitedIds.map(id => ({ _type: 'reference', _ref: id, _key: id }))
    } else {
      unset.push('countriesVisited')
    }
  }

  if (body.languages !== undefined) {
    const cleaned = body.languages.map(l => l.trim()).filter(Boolean).slice(0, 20)
    if (cleaned.length > 0) set.languages = cleaned
    else unset.push('languages')
  }

  const doc = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "userRole" && userId == $uid][0]{ _id }`,
    { uid: session.user.id }
  )

  if (doc) {
    let patch = writeClient.patch(doc._id)
    if (Object.keys(set).length > 0) patch = patch.set(set)
    if (unset.length > 0) patch = patch.unset(unset)
    await patch.commit()
  }

  return NextResponse.json({ ok: true, name: body.name?.trim() })
}
