import { defineField, defineType } from 'sanity'

// Session 5.2 — "A single tracked-link system in the CMS. You paste a
// partner URL once, tag it by type and partner, and it renders everywhere
// with correct tracking, correct rel="sponsored" attributes and click
// counting." One document per real partner relationship — paste the URL
// once here, then reference this same document from as many
// attraction/event/country pages as it's actually relevant to, rather than
// re-pasting the URL on every page it should appear on.
//
// No affiliate accounts exist yet (the plan's own Part 4 lists "affiliate
// partner accounts you already hold, or want" as something only the owner
// can supply) — this is the honest infrastructure for when they do. Zero
// documents of this type exist until the owner creates one in Studio; no
// page fabricates a placeholder "Book now" link to a partner that doesn't
// exist, the same discipline Session 3.2 held the events calendar to
// before real events existed.
//
// clickCount is incremented server-side, by app/go/[slug]/route.ts alone,
// on a real outbound click — never by anything client-side, so it can't be
// inflated by a page view or a bot crawling the site's own HTML.
//
// Session 5.2b — this document type is stream #1 ("Hotel affiliates") and
// #2 ("Ticket affiliates") of the plan's seven-stream revenue sequencing,
// the two the plan marks realistic from day one. It has no field that
// references, sets, or reads event.verificationStatus or
// attraction.contentStatus, and nothing in this codebase lets one — see
// the comment on event.ts's verificationStatus field for the full rule.
// The five other streams (tour partnerships, premium trip planning,
// featured events, sponsored destination pages, advertising) are
// deliberately not built yet; the plan's own sequencing says each needs
// something this site doesn't have yet (real traffic, tourism board
// relationships from Session 5.3, or a proven free planner) before it's
// realistic, not that they were forgotten.

export const affiliateLink = defineType({
  name: 'affiliateLink',
  title: 'Affiliate Link',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Display Label',
      type: 'string',
      description: 'What the link says on the page, e.g. "Book on Booking.com".',
      validation: r => r.required(),
    }),
    defineField({ name: 'partnerName', title: 'Partner Name', type: 'string', description: 'e.g. "Booking.com", "GetYourGuide", "Viator".', validation: r => r.required() }),
    defineField({
      name: 'linkType',
      title: 'Type',
      type: 'string',
      options: { list: ['Hotel', 'Tour', 'Ticket', 'Transport', 'Other'] },
      validation: r => r.required(),
    }),
    defineField({
      name: 'url',
      title: 'Partner URL',
      type: 'url',
      description: 'The real destination — include your own affiliate/tracking parameters here. Visitors never see this directly; they go through /go/[slug] first (see slug below), which logs the click and then sends them on.',
      validation: r => r.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'slug',
      title: 'Tracking Slug',
      type: 'slug',
      description: 'Becomes the public /go/[slug] link. Changing this after the link is live breaks anything already published pointing at the old one.',
      options: { source: 'label' },
      validation: r => r.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
      description: 'Optional. Lets this link appear as a general "where to stay/book" option for a whole country — used by trip itineraries, and as a fallback where no attraction- or event-specific link exists yet.',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Turn off to stop a link appearing anywhere and stop /go/[slug] from redirecting, without deleting the document (and its click history).',
      initialValue: true,
    }),
    defineField({
      name: 'clickCount',
      title: 'Clicks (tracked automatically)',
      type: 'number',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({ name: 'notes', title: 'Internal Notes', type: 'text', rows: 2, description: 'Commission rate, expiry, contact — not shown on the site.' }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
      // Every other document with a createdAt field in this codebase
      // (magicLinkToken, tripInvite, newsletterSubscriber...) is created
      // programmatically, so the app sets it explicitly. This is the one
      // schema this session the owner creates directly in Studio — without
      // a real initialValue it would sit permanently blank there, since
      // Studio doesn't auto-fill a plain datetime field on its own.
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'label', partner: 'partnerName', clicks: 'clickCount', active: 'active' },
    prepare: ({ title, partner, clicks, active }) => ({
      title: title ?? 'Untitled link',
      subtitle: `${partner ?? 'Unknown partner'} · ${clicks ?? 0} click${clicks === 1 ? '' : 's'}${active === false ? ' · INACTIVE' : ''}`,
    }),
  },
})
