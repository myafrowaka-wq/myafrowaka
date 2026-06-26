import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/sanity/lib/writeClient'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, countryName, continentRegion, attractionType, editorialSummary, contentStatus } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  try {
    // Upsert country document
    let countryRef: { _type: string; _ref: string } | undefined
    if (countryName?.trim()) {
      const countrySlug = countryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const existing = await writeClient.fetch<{ _id: string } | null>(
        `*[_type == "country" && slug.current == $slug][0]{ _id }`,
        { slug: countrySlug }
      )
      if (existing) {
        countryRef = { _type: 'reference', _ref: existing._id }
      } else {
        const newCountry = await writeClient.create({
          _type: 'country',
          name: countryName.trim(),
          slug: { _type: 'slug', current: countrySlug },
        })
        countryRef = { _type: 'reference', _ref: newCountry._id }
      }
    }

    const doc = await writeClient.create({
      _type:           'attraction',
      name:            name.trim(),
      slug:            { _type: 'slug', current: slug },
      continentRegion: continentRegion ?? 'East Africa',
      type:            attractionType ? [attractionType] : [],
      editorialSummary: editorialSummary?.trim() ?? '',
      contentStatus:   contentStatus ?? 'Draft',
      ...(countryRef ? { country: countryRef } : {}),
    })

    return NextResponse.json({ ok: true, id: doc._id, slug })
  } catch (err) {
    console.error('[Admin] create-attraction error:', err)
    return NextResponse.json({ error: 'Failed to create attraction in Sanity.' }, { status: 500 })
  }
}
