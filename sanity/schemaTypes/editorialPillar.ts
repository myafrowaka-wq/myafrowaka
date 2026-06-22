import { defineField, defineType } from 'sanity'

export const editorialPillar = defineType({
  name: 'editorialPillar',
  title: 'Editorial Pillar',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "5 Best Attractions to Visit in East Africa"',
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
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      description: '2-4 words. Must be a "best of" search phrase.',
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
      title: 'Ranked Attractions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'attraction',
              title: 'Attraction',
              type: 'reference',
              to: [{ type: 'attraction' }],
              validation: r => r.required(),
            }),
            defineField({
              name: 'framingText',
              title: 'Framing Text',
              type: 'text',
              rows: 3,
              description: '2-3 sentences of original framing. No copying from the attraction guide.',
            }),
          ],
          preview: {
            select: { title: 'attraction.name', subtitle: 'framingText' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'contentStatus' },
  },
})
