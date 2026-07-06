import { defineField, defineType } from 'sanity'

export const savedTrip = defineType({
  name: 'savedTrip',
  title: 'Saved Trip',
  type: 'document',
  fields: [
    defineField({ name: 'userId',      type: 'string',   title: 'User ID'      }),
    defineField({ name: 'userEmail',   type: 'string',   title: 'User Email'   }),
    defineField({ name: 'destination', type: 'string',   title: 'Destination'  }),
    defineField({
      name: 'dates', type: 'object', title: 'Travel Dates',
      fields: [
        defineField({ name: 'from', type: 'string', title: 'From' }),
        defineField({ name: 'to',   type: 'string', title: 'To'   }),
      ],
    }),
    defineField({ name: 'travelers', type: 'string',   title: 'Travelers'  }),
    defineField({ name: 'budget',    type: 'string',   title: 'Budget'     }),
    defineField({ name: 'interests', type: 'array',    title: 'Interests',
      of: [{ type: 'string' }] }),
    defineField({ name: 'savedAt',   type: 'datetime', title: 'Saved At'   }),
  ],
})
