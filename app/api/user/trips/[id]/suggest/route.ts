import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'
import { dateRange } from '@/lib/tripStorage'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

interface TripDoc {
  _id: string
  userId: string
  dates?: { from?: string; to?: string }
  days?: { date?: string }[]
  members?: { userId: string }[]
}

async function loadTripForMember(id: string, userId: string): Promise<{ trip: TripDoc; isOwner: boolean } | null> {
  const trip = await writeClient.fetch<TripDoc | null>(
    `*[_type == "savedTrip" && _id == $id][0]{ _id, userId, dates, days[]{ date }, members[]{ userId } }`,
    { id }
  )
  if (!trip) return null
  const isOwner = trip.userId === userId
  const isMember = (trip.members ?? []).some(m => m.userId === userId)
  if (!isOwner && !isMember) return null
  return { trip, isOwner }
}

// GET — the data a member needs to build a suggestion: the trip's days
// (to pick which one) and that country's published attractions/events (to
// pick what). Kept on this same route rather than a new one since it's
// only ever used alongside POST, by the same "suggest an addition" form.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const access = await loadTripForMember(id, session.user.id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // "country" selected bare (no ->) is the raw {_type:'reference',_ref}
  // object, not an expanded document — reading .{_id} off it is always
  // undefined. Found live: the picker always said "nothing published
  // matches yet" even for a country with real published attractions,
  // because countryId was silently undefined and the query below never ran.
  const trip = await writeClient.fetch<{
    dates?: { from?: string; to?: string }
    country?: { _ref: string } | null
  } | null>(
    `*[_type == "savedTrip" && _id == $id][0]{ dates, country }`,
    { id }
  )
  const countryId = trip?.country?._ref
  const items = countryId
    ? await writeClient.fetch<{ kind: string; name: string; slug: string }[]>(
        `*[(_type == "attraction" || _type == "event") && contentStatus == "Published" && references($countryId)]{
          "kind": _type, name, "slug": slug.current
        } | order(name asc)`,
        { countryId }
      )
    : []

  // The full date range, not just days[] — that array only ever holds
  // entries for days that already have an item on them (see
  // components/TripPlanner.tsx's addItem()), so a day the owner hasn't
  // touched yet would otherwise be un-suggestible.
  return NextResponse.json({
    days: dateRange(trip?.dates?.from ?? '', trip?.dates?.to ?? ''),
    items,
  })
}

// POST — "Everyone on a trip can suggest additions." A member (or the
// owner, though the owner can just add directly via the main trips route)
// proposes an attraction/event for a specific day.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const access = await loadTripForMember(id, session.user.id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => null) as { date?: string; kind?: 'attraction' | 'event'; slug?: string; note?: string } | null
  if (!body?.date || !body?.kind || !body?.slug) {
    return NextResponse.json({ error: 'Missing date, kind, or slug.' }, { status: 400 })
  }

  // The picker UI only ever offers a day from dateRange(trip.dates), but a
  // direct request could send anything — same "don't trust the client on
  // what the UI happens to restrict" reasoning as the Published-only check
  // just below.
  const validDays = dateRange(access.trip.dates?.from ?? '', access.trip.dates?.to ?? '')
  if (!validDays.includes(body.date)) {
    return NextResponse.json({ error: 'That date is outside this trip.' }, { status: 400 })
  }

  const resolved = await writeClient.fetch<{ _id: string } | null>(
    `*[(_type == "attraction" || _type == "event") && _type == $type && contentStatus == "Published" && slug.current == $slug][0]{ _id }`,
    { type: body.kind, slug: body.slug }
  )
  if (!resolved) return NextResponse.json({ error: 'That item is not published.' }, { status: 400 })

  const key = `${session.user.id}-${body.kind}-${body.slug}-${Date.now()}`
  await writeClient.patch(id).setIfMissing({ suggestions: [] }).append('suggestions', [{
    _type: 'tripSuggestion',
    _key: key,
    suggestedByUserId: session.user.id,
    suggestedByName: session.user.name ?? session.user.email ?? 'Someone',
    date: body.date,
    item: { _type: 'reference', _ref: resolved._id },
    note: (body.note ?? '').trim().slice(0, 300),
    status: 'pending',
    suggestedAt: new Date().toISOString(),
  }]).commit()

  return NextResponse.json({ ok: true })
}

// PATCH — the owner approves (moves the item onto the actual day) or
// rejects a pending suggestion. "The person who created it approves them."
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const trip = await writeClient.fetch<{
    _id: string; userId: string
    days?: { _key: string; date?: string }[]
    suggestions?: { _key: string; date?: string; item?: { _ref: string }; status?: string }[]
  } | null>(
    `*[_type == "savedTrip" && _id == $id][0]{ _id, userId, days[]{ _key, date }, suggestions[]{ _key, date, item, status } }`,
    { id }
  )
  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Only the trip owner can approve suggestions.' }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { suggestionKey?: string; action?: 'approve' | 'reject' } | null
  if (!body?.suggestionKey || !body?.action) {
    return NextResponse.json({ error: 'Missing suggestionKey or action.' }, { status: 400 })
  }

  const suggestion = (trip.suggestions ?? []).find(s => s._key === body.suggestionKey)
  if (!suggestion) return NextResponse.json({ error: 'Suggestion not found.' }, { status: 404 })
  if (suggestion.status !== 'pending') return NextResponse.json({ error: 'Already decided.' }, { status: 400 })

  let patch = writeClient.patch(id).set({
    [`suggestions[_key=="${body.suggestionKey}"].status`]: body.action === 'approve' ? 'approved' : 'rejected',
  })

  if (body.action === 'approve' && suggestion.item) {
    const existingDay = (trip.days ?? []).find(d => d.date === suggestion.date)
    const newItem = { _type: 'tripItem', _key: `${suggestion._key}-item`, item: suggestion.item }
    if (existingDay) {
      patch = patch.append(`days[_key=="${existingDay._key}"].items`, [newItem])
    } else {
      patch = patch.append('days', [{ _type: 'tripDay', _key: suggestion.date || Math.random().toString(36).slice(2), date: suggestion.date, items: [newItem] }])
    }
  }

  await patch.set({ updatedAt: new Date().toISOString() }).commit()
  return NextResponse.json({ ok: true })
}
