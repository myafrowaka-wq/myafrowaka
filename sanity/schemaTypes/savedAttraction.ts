import { defineField, defineType } from 'sanity'

// Batch 1 (owner's "Honeymoon collection" request, 2026-09-06) — added
// collectionName so a save can belong to a named group instead of one
// flat list per person. Defaults to 'General' everywhere it's read (see
// app/api/user/saved/route.ts and lib/collections.ts) rather than being
// required here, so every saved record written before this change keeps
// working with no migration needed — an old document with no
// collectionName at all is just interpreted as 'General'.
export const savedAttraction = defineType({
  name: 'savedAttraction',
  title: 'Saved Attraction',
  type: 'document',
  fields: [
    defineField({ name: 'userId',         type: 'string', title: 'User ID'          }),
    defineField({ name: 'userEmail',       type: 'string', title: 'User Email'       }),
    defineField({ name: 'attractionSlug', type: 'string', title: 'Attraction Slug'  }),
    defineField({ name: 'collectionName', type: 'string', title: 'Collection Name', description: 'e.g. "Honeymoon", "Family trip 2027". Defaults to General.' }),
    defineField({ name: 'savedAt',        type: 'datetime', title: 'Saved At'       }),
  ],
})
