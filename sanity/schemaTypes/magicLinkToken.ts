import { defineField, defineType } from 'sanity'

// Session 4.1 — "Add email sign-in alongside Google, because plenty of your
// audience does not use Google accounts." NextAuth v5's own built-in Email
// provider needs a full database Adapter (createVerificationToken,
// getUserByEmail, etc.) to hold its tokens — this app deliberately has none;
// auth.ts talks to Sanity with plain, direct HTTP calls instead (see
// fetchRole/createRole there). Rather than bolt on an Adapter for one
// feature, a magic-link token is just another one of those plain documents,
// consistent with how the rest of this app already handles auth state.
//
// Only a SHA-256 hash of the token is ever stored — never the raw token —
// so a leaked/exported dataset can't be used to sign in as anyone. The raw
// token only ever exists in the email itself and in memory for the seconds
// it takes to hash it.

export const magicLinkToken = defineType({
  name: 'magicLinkToken',
  title: 'Magic Link Token',
  type: 'document',
  fields: [
    defineField({ name: 'email',     type: 'string',   title: 'Email' }),
    defineField({ name: 'tokenHash', type: 'string',   title: 'Token Hash (SHA-256)' }),
    defineField({ name: 'expiresAt', type: 'datetime', title: 'Expires At' }),
    defineField({ name: 'usedAt',    type: 'datetime', title: 'Used At' }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Created At' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'expiresAt' },
  },
})
