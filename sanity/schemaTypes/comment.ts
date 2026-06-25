import { defineField, defineType } from 'sanity'

export const comment = defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({ name: 'userId',         type: 'string',  title: 'User ID'          }),
    defineField({ name: 'userName',       type: 'string',  title: 'User Name'        }),
    defineField({ name: 'userEmail',      type: 'string',  title: 'User Email'       }),
    defineField({ name: 'attractionSlug', type: 'string',  title: 'Attraction Slug'  }),
    defineField({ name: 'text',           type: 'text',    title: 'Comment Text'     }),
    defineField({ name: 'approved',       type: 'boolean', title: 'Approved',        initialValue: false }),
    defineField({ name: 'createdAt',      type: 'datetime', title: 'Created At'      }),
  ],
})
