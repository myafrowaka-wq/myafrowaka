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
      options: {
        list: [
          { title: 'Subscriber',   value: 'subscriber'   },
          { title: 'Moderator',    value: 'moderator'    },
          { title: 'Contributor',  value: 'contributor'  },
          { title: 'Author-Editor',value: 'author-editor'},
          { title: 'Admin',        value: 'admin'        },
          { title: 'Visitor (legacy)', value: 'visitor'  },
        ],
      },
      initialValue: 'subscriber',
    }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Joined At' }),
  ],
})
