import { createClient } from 'next-sanity'

// Session 5.1 — "Fix the fake popup." Same hashed-token, plain-Sanity-
// document pattern as lib/magicLink.ts and lib/tripInvite.ts (see
// sanity/schemaTypes/newsletterSubscriber.ts for why). Not imported by
// auth.ts/middleware, so — like tripInvite.ts — this can use the normal
// next-sanity client and its safe query-parameter binding.

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// A confirm link only has to survive someone actually checking their inbox,
// but people leave a tab or email client open — 48 hours rather than
// magicLink.ts's 15 minutes, which is a "click this in the next few
// minutes" flow, not "confirm you meant to subscribe."
export const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashToken(rawToken: string): Promise<string> {
  const data = new TextEncoder().encode(rawToken)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(digest))
}

function newRawToken(): string {
  return bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(32)))
}

export interface SubscribeInput {
  email: string
  homeCountryId?: string
  interests?: string[]
  source?: string
  linkedUserId?: string
}

export interface SubscribeResult {
  needsConfirmEmail: boolean
  /** Only present when needsConfirmEmail is true — the raw values to embed
   * in the confirmation email's confirm/unsubscribe links. Never stored;
   * only the hash of each ever touches Sanity. */
  confirmToken?: string
  unsubscribeToken?: string
}

/**
 * Creates a pending subscriber, or re-arms confirmation for an existing one
 * that isn't already confirmed. Deliberately never reveals to the caller
 * which case it hit beyond `needsConfirmEmail` — the route's response text
 * stays identical either way, so this can't be used to probe whether an
 * arbitrary email address is already on the list.
 *
 * Re-subscribing after a previous unsubscribe always issues a brand-new
 * confirm token AND a brand-new unsubscribe token, not a reused one — the
 * old unsubscribe token's raw value was never kept (same discipline as
 * every hashed token in this codebase), so there's nothing to reuse, and a
 * fresh opt-in genuinely re-confirming consent is the whole point of
 * double opt-in in the first place, not a formality to route around.
 */
export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  const email = input.email.trim().toLowerCase()
  const now = new Date().toISOString()

  const existing = await writeClient.fetch<{ _id: string; status: string } | null>(
    `*[_type == "newsletterSubscriber" && email == $email][0]{ _id, status }`,
    { email }
  )

  if (existing?.status === 'confirmed') {
    // Already an active subscriber. Update their preferences if this
    // submission carried new ones, but send nothing — nothing about their
    // consent changed.
    const patch: Record<string, unknown> = {}
    if (input.homeCountryId) patch.homeCountry = { _type: 'reference', _ref: input.homeCountryId }
    if (input.interests?.length) patch.interests = input.interests
    if (Object.keys(patch).length > 0) {
      await writeClient.patch(existing._id).set(patch).commit()
    }
    return { needsConfirmEmail: false }
  }

  const confirmToken = newRawToken()
  const unsubscribeToken = newRawToken()
  const [confirmTokenHash, unsubscribeTokenHash] = await Promise.all([
    hashToken(confirmToken),
    hashToken(unsubscribeToken),
  ])

  const fields = {
    email,
    status: 'pending',
    confirmTokenHash,
    confirmTokenIssuedAt: now,
    unsubscribeTokenHash,
    ...(input.homeCountryId ? { homeCountry: { _type: 'reference', _ref: input.homeCountryId } } : {}),
    ...(input.interests?.length ? { interests: input.interests } : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.linkedUserId ? { linkedUserId: input.linkedUserId } : {}),
  }

  if (existing) {
    await writeClient.patch(existing._id).set(fields).unset(['confirmedAt', 'unsubscribedAt']).commit()
  } else {
    await writeClient.create({ _type: 'newsletterSubscriber', ...fields, createdAt: now })
  }

  return { needsConfirmEmail: true, confirmToken, unsubscribeToken }
}

export interface PendingSubscriber {
  _id: string
  email: string
  status: string
  confirmTokenIssuedAt?: string
}

/** Looks up a subscriber by their raw confirm token, for display purposes
 * only (the real confirm page reads this before showing a "Confirm your
 * subscription" button, including checking expiry itself so the page can
 * show an honest "this link expired" state rather than a generic error
 * after clicking). Does not confirm anything itself — confirmSubscription()
 * is the only thing that changes state, and only when a real POST calls
 * it. Returns null for an unknown token rather than throwing, so a bad/old
 * token just 404s. */
export async function findByConfirmToken(rawToken: string): Promise<PendingSubscriber | null> {
  if (!rawToken) return null
  const tokenHash = await hashToken(rawToken)
  return writeClient.fetch<PendingSubscriber | null>(
    `*[_type == "newsletterSubscriber" && confirmTokenHash == $tokenHash][0]{ _id, email, status, confirmTokenIssuedAt }`,
    { tokenHash }
  ).catch(() => null)
}

export function isConfirmTokenExpired(issuedAt?: string): boolean {
  if (!issuedAt) return true
  return Date.now() - new Date(issuedAt).getTime() > CONFIRM_TTL_MS
}

/** The actual confirm action — moves a pending subscriber to confirmed.
 * Re-checks expiry itself rather than trusting whatever the page rendered
 * (the page's own check is a display nicety, not the real gate — the same
 * "server decides, client only reflects" shape as every other token flow
 * in this app). Idempotent: confirming an already-confirmed subscriber
 * just succeeds again rather than erroring, since clicking an old confirm
 * email a second time (or the same email client rendering it twice) is a
 * normal thing to happen, not an attack — and an already-confirmed
 * subscriber's token can't have "expired" in any way that matters, so the
 * expiry check only applies to a still-pending one. An unsubscribed
 * subscriber can't be re-confirmed by an old link, though — that would
 * silently undo a real opt-out; they have to go through /newsletter and
 * consent again. */
export async function confirmSubscription(rawToken: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const subscriber = await findByConfirmToken(rawToken)
  if (!subscriber) return { ok: false, error: 'This confirmation link is not valid.' }
  if (subscriber.status === 'unsubscribed') {
    return { ok: false, error: 'This subscription was cancelled. Sign up again at /newsletter for a new confirmation link.' }
  }
  if (subscriber.status === 'pending' && isConfirmTokenExpired(subscriber.confirmTokenIssuedAt)) {
    return { ok: false, error: 'This confirmation link has expired. Sign up again at /newsletter for a new one.' }
  }
  if (subscriber.status !== 'confirmed') {
    await writeClient.patch(subscriber._id).set({ status: 'confirmed', confirmedAt: new Date().toISOString() }).commit()
  }
  return { ok: true }
}

export interface UnsubscribeTarget {
  _id: string
  email: string
  status: string
}

/** Read-only lookup, same shape as findByConfirmToken — the unsubscribe
 * page uses this to show who's unsubscribing before anything actually
 * changes. See unsubscribe() for why the actual state change never
 * happens on a GET. */
export async function findByUnsubscribeToken(rawToken: string): Promise<UnsubscribeTarget | null> {
  if (!rawToken) return null
  const tokenHash = await hashToken(rawToken)
  return writeClient.fetch<UnsubscribeTarget | null>(
    `*[_type == "newsletterSubscriber" && unsubscribeTokenHash == $tokenHash][0]{ _id, email, status }`,
    { tokenHash }
  ).catch(() => null)
}

/** Idempotent on purpose — a person clicking "unsubscribe" twice should
 * just see the same confirmation both times, not an error. Deliberately
 * only ever called from a real POST triggered by an explicit button click
 * (app/api/newsletter/unsubscribe/route.ts), never from the page's own GET
 * render — an email client or corporate security gateway pre-fetching
 * every link in an email is a real, common thing, and it must never be the
 * thing that unsubscribes someone who never clicked anything. */
export async function unsubscribe(rawToken: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const subscriber = await findByUnsubscribeToken(rawToken)
  if (!subscriber) return { ok: false, error: 'This unsubscribe link is not valid.' }
  if (subscriber.status !== 'unsubscribed') {
    await writeClient.patch(subscriber._id).set({ status: 'unsubscribed', unsubscribedAt: new Date().toISOString() }).commit()
  }
  return { ok: true }
}
