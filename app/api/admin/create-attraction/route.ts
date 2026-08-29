import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/sanity/lib/writeClient'
import { atLeast } from '@/lib/roles'
import type { UserRole } from '@/types/next-auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user?.role ?? 'visitor') as UserRole
  if (!session?.user || !atLeast(role, 'contributor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, countryName, continentRegion, attractionType, editorialSummary } = body
  let { contentStatus } = body

  // Contributors can only create as Draft — same restriction the PATCH
  // route (app/api/admin/attractions/route.ts) enforces when moving an
  // existing attraction through the pipeline, so a Contributor can't
  // self-verify or self-publish through this route either.
  if (role === 'contributor' && contentStatus && contentStatus !== 'Draft') {
    contentStatus = 'Draft'
  }

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
      // Session 4.3 — real contributor credit needs to know who actually
      // submitted this, which nothing recorded before now.
      submittedByUserId: session.user.id,
      submittedByName:   session.user.name ?? session.user.email ?? '',
      ...(countryRef ? { country: countryRef } : {}),
    })

    return NextResponse.json({ ok: true, id: doc._id, slug })
  } catch (err) {
    console.error('[Admin] create-attraction error:', err)
    return NextResponse.json({ error: 'Failed to create attraction in Sanity.' }, { status: 500 })
  }
}
