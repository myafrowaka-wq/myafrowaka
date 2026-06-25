import { defineField, defineType } from 'sanity'

export const userRole = defineType({
  name: 'userRole',
  title: 'User Role',
  type: 'document',
  fields: [
    defineField({ name: 'userId',    type: 'string',   title: 'User ID'   }),
    defineField({ name: 'userEmail', type: 'string',   title: 'Email'     }),
    defineField({ name: 'userName',  type: 'string',   title: 'Name'      }),
    defineField({
      name: 'role', type: 'string', title: 'Role',
      options: { list: ['visitor', 'contributor', 'admin'] },
      initialValue: 'visitor',
    }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Joined At' }),
  ],
})
