import { defineField, defineType } from 'sanity'

export const savedAttraction = defineType({
  name: 'savedAttraction',
  title: 'Saved Attraction',
  type: 'document',
  fields: [
    defineField({ name: 'userId',         type: 'string', title: 'User ID'          }),
    defineField({ name: 'userEmail',       type: 'string', title: 'User Email'       }),
    defineField({ name: 'attractionSlug', type: 'string', title: 'Attraction Slug'  }),
    defineField({ name: 'savedAt',        type: 'datetime', title: 'Saved At'       }),
  ],
})
