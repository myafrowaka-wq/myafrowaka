import { defineField, defineType } from 'sanity'

// Session 4.1 — "Build the profile: photo, home country, travel style,
// countries visited, languages." This document was previously just a role
// record (userId/email/name/role); it's the natural, already-existing
// per-user document to extend rather than inventing a second "profile"
// content type that would need its own userId-matching lookup logic
// duplicated everywhere auth.ts and the dashboard already query this one.
//
// `photo` is a plain Sanity `image`, deliberately not the `sourcedImage`
// type Session 2.4 built for editorial photography. sourcedImage demands a
// real photographer credit and licence — exactly right for a photo of a
// place a visitor didn't take themselves, and exactly wrong to ask of a
// user uploading their own profile picture. Reusing it here would be a
// real misapplication of that pipeline, not a shortcut.

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

    // ─── PROFILE ─────────────────────────────────────────────────────────────
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'homeCountry',
      title: 'Home Country',
      type: 'reference',
      to: [{ type: 'country' }],
      description: 'Lets the homepage personalise what a Nigerian in Lagos and an American in Chicago each see, and is the foundation for Phase 5 newsletter segmenting.',
    }),
    defineField({
      name: 'travelStyle',
      title: 'Travel Style',
      type: 'string',
      description: 'Reuses the same travel-style vocabulary already used to tag attractions and events, rather than inventing a second, parallel list.',
      options: {
        list: [
          'Solo Travelers', 'Couples', 'Families', 'Backpackers',
          'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
        ].map(v => ({ title: v, value: v })),
      },
    }),
    defineField({
      name: 'countriesVisited',
      title: 'Countries Visited',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'country' }] }],
    }),
    defineField({
      name: 'languages',
      title: 'Languages Spoken',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  preview: {
    select: { title: 'userName', subtitle: 'userEmail', media: 'photo' },
  },
})
