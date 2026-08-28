import { defineField, defineType } from 'sanity'

// Session 3.4 — /events/collections/[collection], "editorial picks."
// Mirrors editorialPillar.ts's existing pattern for exactly the same job on
// attractions (a curated, hand-picked list with original framing text per
// item) rather than inventing a second way to do the same thing. A
// collection is a human editorial choice — "Best Music Festivals for Solo
// Travelers" — not a filter that could just be a category page, which is
// why this is a real content type with real framing text per event, not a
// saved-search.

export const eventCollection = defineType({
  name: 'eventCollection',
  title: 'Event Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "Best Music Festivals for Solo Travelers"',
      validation: r => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: r => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'What ties this collection together and why it matters — shown at the top of the page.',
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: r => r.max(65),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 2,
      validation: r => r.max(160),
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
    defineField({
      name: 'items',
      title: 'Curated Events',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'event',
              title: 'Event',
              type: 'reference',
              to: [{ type: 'event' }],
              validation: r => r.required(),
            }),
            defineField({
              name: 'framingText',
              title: 'Framing Text',
              type: 'text',
              rows: 3,
              description: '2-3 sentences of original framing — why this event belongs in this collection. Not copied from the event page.',
            }),
          ],
          preview: {
            select: { title: 'event.name', subtitle: 'framingText' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'contentStatus' },
  },
})
