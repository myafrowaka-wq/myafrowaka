import { defineField, defineType } from 'sanity'

export const testItem = defineType({
  name: 'testItem',
  title: 'Test Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
  ],
})
