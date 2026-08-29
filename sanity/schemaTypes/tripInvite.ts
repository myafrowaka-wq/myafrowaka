import { defineField, defineType } from 'sanity'

// Session 4.3 — "Press 'Invite friends.' Enter up to five emails with a
// personal note. They get a branded email showing the itinerary. They
// click, see the trip, and can join it." Same pattern as
// magicLinkToken.ts — a plain Sanity document holding only a SHA-256 hash
// of the invite token, never the raw value, so a leaked/exported dataset
// can't be used to join trips as anyone. The raw token only ever exists in
// the email itself.
//
// Unlike a magic-link sign-in token, an accepted invite needs to be
// findable afterward (the join page shows "already used" instead of a
// dead end, and Studio can show who actually joined) — so this stores
// `status` rather than just a usedAt timestamp.
//
// `status` only ever moves pending -> accepted (lib/tripInvite.ts); there
// is no code path that sets "expired" — an expired-but-unused invite stays
// "pending" forever in Studio, and every real expiry check (the join page,
// acceptTripInvite()) compares `expiresAt` against the current time
// instead. Kept the options list to just the two real values rather than
// promise a third state nothing produces.

export const tripInvite = defineType({
  name: 'tripInvite',
  title: 'Trip Invite',
  type: 'document',
  fields: [
    defineField({ name: 'trip', title: 'Trip', type: 'reference', to: [{ type: 'savedTrip' }], validation: r => r.required() }),
    defineField({ name: 'email', type: 'string', title: 'Invited Email' }),
    defineField({ name: 'note', type: 'text', rows: 3, title: 'Personal Note' }),
    defineField({ name: 'tokenHash', type: 'string', title: 'Token Hash (SHA-256)' }),
    defineField({ name: 'invitedByUserId', type: 'string', title: 'Invited By (User ID)' }),
    defineField({ name: 'invitedByName', type: 'string', title: 'Invited By (Name)' }),
    defineField({
      name: 'status', type: 'string', title: 'Status',
      options: { list: ['pending', 'accepted'] },
      initialValue: 'pending',
    }),
    defineField({ name: 'expiresAt', type: 'datetime', title: 'Expires At' }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Created At' }),
    defineField({ name: 'acceptedAt', type: 'datetime', title: 'Accepted At' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'status' },
  },
})
