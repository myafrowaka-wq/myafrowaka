// Session 4.1 — shared helpers for the magic-link email sign-in, used by
// both the request route (app/api/auth/magic-link/route.ts) and auth.ts's
// Credentials provider (which validates the token when the link is clicked).
// See sanity/schemaTypes/magicLinkToken.ts for why this stores a hash of the
// token, and why it's a plain Sanity document rather than a NextAuth Adapter.
//
// Uses the Web Crypto API (globalThis.crypto), not Node's `node:crypto` —
// auth.ts is pulled into middleware.ts, which runs on the Edge runtime and
// can't resolve `node:` imports. Web Crypto works in both the Node.js and
// Edge runtimes (and browsers), so this file is safe to import from either.

export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000 // 15 minutes

const SANITY_PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET!
const SANITY_TOKEN   = process.env.SANITY_API_WRITE_TOKEN!
const sanityUrl = `https://${SANITY_PROJECT}.api.sanity.io/v2024-01-01/data`

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashToken(rawToken: string): Promise<string> {
  const data = new TextEncoder().encode(rawToken)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(digest))
}

/** Generates a fresh random token and stores its hash in Sanity, tied to `email`. */
export async function createMagicLinkToken(email: string): Promise<string> {
  const rawToken = bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(32)))
  const now = new Date()
  const expiresAt = new Date(now.getTime() + MAGIC_LINK_TTL_MS)
  const tokenHash = await hashToken(rawToken)

  await fetch(`${sanityUrl}/mutate/${SANITY_DATASET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SANITY_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mutations: [{
        create: {
          _type: 'magicLinkToken',
          email: email.toLowerCase(),
          tokenHash,
          expiresAt: expiresAt.toISOString(),
          createdAt: now.toISOString(),
        },
      }],
    }),
  })

  return rawToken
}

/**
 * Validates a (email, token) pair against Sanity: must exist, be unexpired,
 * and not already used. On success, marks it used (single-use) and returns
 * true. Never throws — a malformed or missing token is just an invalid link.
 */
export async function consumeMagicLinkToken(email: string, rawToken: string): Promise<boolean> {
  if (!email || !rawToken) return false
  try {
    const tokenHash = await hashToken(rawToken)
    const query  = encodeURIComponent(
      '*[_type=="magicLinkToken" && email==$email && tokenHash==$tokenHash && !defined(usedAt)][0]{_id, expiresAt}'
    )
    // Each $param needs its own JSON-encoded value in the URL — see the
    // comment on fetchRole() in auth.ts for the bug this avoids.
    const emailParam     = encodeURIComponent(JSON.stringify(email.toLowerCase()))
    const tokenHashParam = encodeURIComponent(JSON.stringify(tokenHash))
    const res  = await fetch(`${sanityUrl}/query/${SANITY_DATASET}?query=${query}&$email=${emailParam}&$tokenHash=${tokenHashParam}`, {
      headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
      cache: 'no-store',
    })
    const json = await res.json()
    const doc = json.result as { _id: string; expiresAt: string } | null
    if (!doc) return false
    if (new Date(doc.expiresAt).getTime() < Date.now()) return false

    // Mark used immediately so the same link can't be replayed.
    await fetch(`${sanityUrl}/mutate/${SANITY_DATASET}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SANITY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mutations: [{ patch: { id: doc._id, set: { usedAt: new Date().toISOString() } } }],
      }),
    })
    return true
  } catch {
    return false
  }
}
