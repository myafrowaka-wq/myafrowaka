import { defineField, defineType } from 'sanity'

// Session 5.3 — "A tourismBoard content type... a quiet feature with a
// loud payoff. It gives you a reason to contact all 54 tourism
// authorities, and 'we have built you a profile page, will you verify your
// events calendar' is a far better opening than 'please link to us.' That
// relationship is how 'Verified by MyAfroWaka' becomes real rather than
// self-declared." verifiedEvents is that mechanism made concrete: a real
// reference array, not a claim in prose — an event only appears here once
// a real board has actually confirmed it, the same discipline
// event.verificationStatus already holds itself to (see that field's own
// comment on Session 5.2b's "money never touches verification" rule,
// which applies here too: a board profile is never something payment can
// buy or influence).
//
// Real, sourced data only — mirrors the discipline Session 2.2 held the
// 47 country overviews to. Most of the 54 African tourism authorities
// have no profile here yet; an empty state is honest, a fabricated one
// is not.

export const tourismBoard = defineType({
  name: 'tourismBoard',
  title: 'Tourism Board',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Authority Name',
      type: 'string',
      description: 'The real, official name — e.g. "Egyptian Tourism Authority", not a shortened or invented version.',
      validation: r => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: r => r.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
      validation: r => r.required(),
    }),
    defineField({
      name: 'coverage',
      title: 'What They Cover',
      type: 'text',
      rows: 3,
      description: 'What this authority is actually responsible for — a whole country, a region, a specific circuit. Real scope, not marketing copy.',
    }),
    defineField({
      name: 'officialUrl',
      title: 'Official Website',
      type: 'url',
      validation: r => r.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'officialEventsCalendarUrl',
      title: 'Official Events Calendar URL',
      type: 'url',
      description: 'Their own calendar, if they publish one — the actual outreach hook: "we built you a profile, will you verify your calendar?"',
      validation: r => r.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'pressContactName',
      title: 'Press Contact Name',
      type: 'string',
    }),
    defineField({
      name: 'pressContactEmail',
      title: 'Press Contact Email',
      type: 'string',
      validation: r => r.email(),
    }),
    defineField({
      name: 'verifiedEvents',
      title: 'Events This Board Has Verified',
      type: 'array',
      description: 'Only events this specific authority has actually confirmed — the real mechanism behind "Verified by MyAfroWaka," not a claim. Empty until a real relationship exists.',
      of: [{ type: 'reference', to: [{ type: 'event' }] }],
    }),
    defineField({
      name: 'sourceNote',
      title: 'Source / Verification Note',
      type: 'text',
      rows: 2,
      description: 'Where this profile\'s details came from and when checked — e.g. "Official site, checked August 2026." [VERIFY] anything not independently confirmable.',
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'Draft' },
          { title: 'Published', value: 'Published' },
          { title: 'Archived', value: 'Archived' },
        ],
      },
      initialValue: 'Draft',
    }),
  ],
  preview: {
    select: { title: 'name', country: 'country.name', status: 'contentStatus' },
    prepare: ({ title, country, status }) => ({
      title: title ?? 'Untitled tourism board',
      subtitle: [country, status].filter(Boolean).join(' · '),
    }),
  },
})
