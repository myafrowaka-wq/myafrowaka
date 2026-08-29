import { defineField, defineType } from 'sanity'

// Session 5.1 — "Fix the fake popup. Right now it lies to people." The old
// NewsletterPopup.tsx called setSubmitted(true) on a timer without ever
// sending the address anywhere (flagged, out of scope, back in Session
// 3.3). This is the real thing it should have been from the start: a
// document per subscriber, double opt-in (confirmed by email before
// anything is ever sent to them, which is what "keeps your sending
// reputation clean" actually means — Gmail/Outlook treat a list nobody
// confirmed as spam-shaped), a permanent unsubscribe link, and the
// segmenting fields (home country, travel interest) the plan asks for.
//
// Same hashed-token pattern as magicLinkToken.ts and tripInvite.ts: only a
// SHA-256 hash of each token is ever stored, never the raw value, so a
// leaked/exported dataset can't be used to confirm or unsubscribe anyone.
// Two separate tokens, not one, because they have different lifetimes —
// confirmTokenHash is single-use and only matters until it's clicked once;
// unsubscribeTokenHash has to keep working correctly for as long as the
// subscription is active, since it sits in the footer of every email sent.

export const newsletterSubscriber = defineType({
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    defineField({ name: 'email', type: 'string', title: 'Email', validation: r => r.required() }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['pending', 'confirmed', 'unsubscribed'] },
      initialValue: 'pending',
    }),
    defineField({
      name: 'homeCountry',
      title: 'Home Country',
      type: 'reference',
      to: [{ type: 'country' }],
      description: 'Optional. Lets a campaign speak differently to a diaspora reader than a first-time visitor.',
    }),
    defineField({
      name: 'interests',
      title: 'Travel Interests',
      type: 'array',
      description: 'Same vocabulary already used for travel style on userRole.ts and to tag attractions/events, reused rather than inventing a second list — multiple allowed here since a signup form is a lower-commitment moment than a full profile.',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
        list: [
          'Solo Travelers', 'Couples', 'Families', 'Backpackers',
          'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
        ].map(v => ({ title: v, value: v })),
      },
    }),
    defineField({ name: 'source', type: 'string', title: 'Signup Source', description: 'e.g. "popup" or "newsletter-page" — which form captured this signup.' }),
    defineField({ name: 'linkedUserId', type: 'string', title: 'Linked User ID', description: 'Set when the subscriber was signed in at the moment they subscribed. Not required — most subscribers will never have an account.' }),
    defineField({ name: 'confirmTokenHash', type: 'string', title: 'Confirm Token Hash (SHA-256)' }),
    defineField({
      name: 'confirmTokenIssuedAt',
      type: 'datetime',
      title: 'Confirm Token Issued At',
      description: 'When the CURRENT confirm token was issued, not when the subscriber record was first created — re-subscribing after unsubscribing issues a fresh token without changing createdAt. lib/newsletter.ts checks this against CONFIRM_TTL_MS.',
    }),
    defineField({ name: 'unsubscribeTokenHash', type: 'string', title: 'Unsubscribe Token Hash (SHA-256)' }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Created At' }),
    defineField({ name: 'confirmedAt', type: 'datetime', title: 'Confirmed At' }),
    defineField({ name: 'unsubscribedAt', type: 'datetime', title: 'Unsubscribed At' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'status' },
  },
})
