import { defineField, defineType } from 'sanity'

export const country = defineType({
  name: 'country',
  title: 'Country',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Country Name',
      type: 'string',
      description: 'Official English country name. Matches ISO 3166-1.',
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
      name: 'continentRegion',
      title: 'Continent Region',
      type: 'string',
      options: {
        list: [
          { title: 'North Africa', value: 'North Africa' },
          { title: 'West Africa', value: 'West Africa' },
          { title: 'East Africa', value: 'East Africa' },
          { title: 'Southern Africa', value: 'Southern Africa' },
          { title: 'Central Africa', value: 'Central Africa' },
          { title: 'Indian Ocean Islands', value: 'Indian Ocean Islands' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'overview',
      title: 'Country Overview',
      type: 'text',
      rows: 4,
      description: 'Short overview paragraph shown on the country hub page.',
    }),
    defineField({
      name: 'quickFacts',
      title: 'Quick Facts',
      type: 'text',
      rows: 3,
      description: 'Capital, currency, language, visa info summary.',
    }),
    defineField({
      name: 'flagEmoji',
      title: 'Flag Emoji',
      type: 'string',
      description: 'e.g. 🇳🇬 for Nigeria',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'continentRegion' },
  },
})
