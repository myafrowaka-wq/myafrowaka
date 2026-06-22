import { defineField, defineType } from 'sanity'

export const city = defineType({
  name: 'city',
  title: 'City',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'City Name',
      type: 'string',
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
      name: 'overview',
      title: 'City Overview',
      type: 'text',
      rows: 4,
      description: 'Short overview paragraph shown on the city hub page.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'country.name',
    },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? `${subtitle}` : '' }
    },
  },
})
