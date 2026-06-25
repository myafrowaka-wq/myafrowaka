import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content Status',
      type: 'string',
      options: { list: ['Draft', 'Published', 'Archived'] },
      initialValue: 'Draft',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown in the listing. Max 280 characters.',
      validation: r => r.max(280),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Displayed in listing cards and as the article hero. Min 1200px wide.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Destinations',        value: 'Destinations'        },
          { title: 'Culture & Heritage',  value: 'Culture & Heritage'  },
          { title: 'Travel Planning',     value: 'Travel Planning'     },
          { title: 'Food Tourism',        value: 'Food Tourism'        },
          { title: 'Experiences',         value: 'Experiences'         },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'featuredCountry',
      title: 'Featured Country',
      type: 'reference',
      to: [{ type: 'country' }],
      description: 'Optional. Links this post to a country landing page.',
    }),
    defineField({
      name: 'body',
      title: 'Article Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt text', validation: r => r.required() }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
          ],
        },
      ],
    }),
    defineField({ name: 'metaTitle',       title: 'Meta Title',       type: 'string', validation: r => r.max(65)  }),
    defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text',   validation: r => r.max(160) }),
    defineField({ name: 'focusKeyword',    title: 'Focus Keyword',    type: 'string'  }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'contentStatus', media: 'coverImage' },
  },
})
