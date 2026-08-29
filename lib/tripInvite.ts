import { createClient } from 'next-sanity'

// Session 4.3 — "Press 'Invite friends.' ... They get a branded email
// showing the itinerary. They click, see the trip, and can join it."
// Same hashed-token pattern as lib/magicLink.ts (see
// sanity/schemaTypes/tripInvite.ts for why). This isn't imported by
// auth.ts/middleware, so — unlike magicLink.ts — it can use the normal
// next-sanity client and its safe query-parameter binding, rather than the
// raw-fetch pattern auth.ts needs for Edge-runtime compatibility.

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days — a trip invite, unlike a sign-in link, needs to survive a friend not checking email for a few days

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashToken(rawToken: string): Promise<string> {
  const data = new TextEncoder().encode(rawToken)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(digest))
}

export interface TripInviteInput {
  tripId: string
  email: string
  note: string
  invitedByUserId: string
  invitedByName: string
}

/** Creates a real tripInvite document and returns the raw token (never stored). */
export async function createTripInvite(input: TripInviteInput): Promise<string> {
  const rawToken = bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(32)))
  const tokenHash = await hashToken(rawToken)
  const now = new Date()

  await writeClient.create({
    _type: 'tripInvite',
    trip: { _type: 'reference', _ref: input.tripId },
    email: input.email.toLowerCase(),
    note: input.note,
    tokenHash,
    invitedByUserId: input.invitedByUserId,
    invitedByName: input.invitedByName,
    status: 'pending',
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
    createdAt: now.toISOString(),
  })

  return rawToken
}

export interface ResolvedInvite {
  _id: string
  status: string
  expiresAt: string
  email: string
  note?: string
  invitedByName?: string
  trip: {
    _id: string
    name: string
    country?: { name: string; slug: string; countryCode?: string } | null
    dates?: { from?: string; to?: string }
    days?: { date?: string; items?: { note?: string; kind: string; name?: string; slug?: string }[] }[]
  } | null
}

/**
 * Looks up an invite by its raw token for *viewing* (the public preview
 * page) — does not check expiry/status itself and never consumes it;
 * that's acceptViaToken()'s job. Returns null for an unknown token rather
 * than throwing, so a bad/old link just 404s.
 */
export async function findTripInviteByToken(rawToken: string): Promise<ResolvedInvite | null> {
  if (!rawToken) return null
  const tokenHash = await hashToken(rawToken)
  return writeClient.fetch<ResolvedInvite | null>(
    `*[_type == "tripInvite" && tokenHash == $tokenHash][0]{
      _id, status, expiresAt, email, note, invitedByName,
      "trip": trip->{
        _id, name,
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
        }
      }
    }`,
    { tokenHash }
  ).catch(() => null)
}

/**
 * The actual join: validates the token is unexpired and still pending,
 * adds the signed-in user to the trip's members, marks the invite
 * accepted. Returns the trip id on success, or an error string a caller
 * can show directly.
 */
export async function acceptTripInvite(
  rawToken: string,
  user: { id: string; email: string; name: string }
): Promise<{ ok: true; tripId: string } | { ok: false; error: string }> {
  const tokenHash = await hashToken(rawToken)
  const invite = await writeClient.fetch<{ _id: string; status: string; expiresAt: string; tripId: string } | null>(
    `*[_type == "tripInvite" && tokenHash == $tokenHash][0]{ _id, status, expiresAt, "tripId": trip->_id }`,
    { tokenHash }
  ).catch(() => null)

  if (!invite) return { ok: false, error: 'This invite link is not valid.' }
  if (invite.status !== 'pending') return { ok: false, error: 'This invite has already been used.' }
  if (new Date(invite.expiresAt).getTime() < Date.now()) return { ok: false, error: 'This invite has expired.' }

  const trip = await writeClient.fetch<{ _id: string; userId: string; members?: { userId: string }[] } | null>(
    `*[_id == $id][0]{ _id, userId, members }`,
    { id: invite.tripId }
  )
  if (!trip) return { ok: false, error: 'This trip no longer exists.' }

  // Already the owner, or already a member — accept idempotently rather
  // than erroring, since clicking an old invite email a second time is a
  // completely normal thing to do.
  const alreadyIn = trip.userId === user.id || (trip.members ?? []).some(m => m.userId === user.id)
  if (!alreadyIn) {
    await writeClient.patch(trip._id).setIfMissing({ members: [] }).append('members', [{
      _type: 'tripMember',
      _key: user.id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      joinedAt: new Date().toISOString(),
    }]).commit()
  }

  await writeClient.patch(invite._id).set({ status: 'accepted', acceptedAt: new Date().toISOString() }).commit()

  return { ok: true, tripId: trip._id }
}
