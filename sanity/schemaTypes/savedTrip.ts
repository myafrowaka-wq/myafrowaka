import { defineField, defineType } from 'sanity'

// Session 4.2 — "The trip planner, version 2." The v1 shape (destination
// string, flat travelers/budget/interests, no day structure) was really an
// intent-capture form, not a planner — nobody could add a specific
// attraction or event to a specific day. This rebuilds it as a real
// itinerary: a country, a date range, and a day-by-day list of items,
// where each item references a real attraction or event document rather
// than duplicating its name/slug (so if an attraction is renamed or
// unpublished, the trip reflects that rather than silently going stale).
//
// Zero savedTrip documents existed under the v1 shape at the time of this
// rebuild (checked directly against the live dataset), so this replaces
// the old fields outright rather than keeping them around for migration.

export const savedTrip = defineType({
  name: 'savedTrip',
  title: 'Saved Trip',
  type: 'document',
  fields: [
    defineField({ name: 'userId',    type: 'string', title: 'User ID'    }),
    defineField({ name: 'userEmail', type: 'string', title: 'User Email' }),
    defineField({
      name: 'name',
      title: 'Trip Name',
      type: 'string',
      description: 'What the traveler named their trip, e.g. "Ghana in August".',
      validation: r => r.required().max(80),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
      validation: r => r.required(),
    }),
    defineField({
      name: 'dates',
      title: 'Travel Dates',
      type: 'object',
      fields: [
        defineField({ name: 'from', type: 'date', title: 'From' }),
        defineField({ name: 'to',   type: 'date', title: 'To'   }),
      ],
    }),
    defineField({
      name: 'days',
      title: 'Itinerary Days',
      type: 'array',
      of: [{
        type: 'object',
        name: 'tripDay',
        fields: [
          defineField({ name: 'date', type: 'date', title: 'Date' }),
          defineField({
            name: 'items',
            title: 'Items',
            type: 'array',
            of: [{
              type: 'object',
              name: 'tripItem',
              fields: [
                defineField({
                  name: 'item',
                  title: 'Attraction or Event',
                  type: 'reference',
                  to: [{ type: 'attraction' }, { type: 'event' }],
                  validation: r => r.required(),
                }),
                defineField({ name: 'note', type: 'string', title: 'Note' }),
              ],
              preview: {
                // Both attraction and event documents have a `name` field,
                // so this one path resolves either way.
                select: { name: 'item.name' },
                prepare: ({ name }) => ({ title: name ?? 'Item' }),
              },
            }],
          }),
        ],
        preview: {
          select: { date: 'date', items: 'items' },
          prepare: ({ date, items }) => ({
            title: date ?? 'Day',
            subtitle: `${(items ?? []).length} item(s)`,
          }),
        },
      }],
    }),
    // ─── SHARED TRIPS (Session 4.3) ─────────────────────────────────────────
    // "Everyone on a trip can suggest additions. The person who created it
    // approves them." The owner is whoever this document's userId already
    // belongs to (unchanged) — members are people who joined via a real
    // invite (see tripInvite.ts), not co-owners.
    defineField({
      name: 'members',
      title: 'Members',
      type: 'array',
      description: 'Everyone who has joined this trip via invite. Does not include the owner.',
      of: [{
        type: 'object',
        name: 'tripMember',
        fields: [
          defineField({ name: 'userId',   type: 'string',   title: 'User ID'   }),
          defineField({ name: 'userEmail', type: 'string',  title: 'Email'     }),
          defineField({ name: 'userName', type: 'string',   title: 'Name'      }),
          defineField({ name: 'joinedAt', type: 'datetime', title: 'Joined At' }),
        ],
        preview: {
          select: { title: 'userName', subtitle: 'userEmail' },
        },
      }],
    }),
    defineField({
      name: 'suggestions',
      title: 'Suggested Additions',
      type: 'array',
      description: 'Items a member proposed adding, awaiting the owner\'s approval or rejection.',
      of: [{
        type: 'object',
        name: 'tripSuggestion',
        fields: [
          defineField({ name: 'suggestedByUserId', type: 'string', title: 'Suggested By (User ID)' }),
          defineField({ name: 'suggestedByName',   type: 'string', title: 'Suggested By (Name)'    }),
          defineField({ name: 'date', type: 'date', title: 'Day' }),
          defineField({
            name: 'item', title: 'Attraction or Event', type: 'reference',
            to: [{ type: 'attraction' }, { type: 'event' }],
            validation: r => r.required(),
          }),
          defineField({ name: 'note', type: 'string', title: 'Note' }),
          defineField({
            name: 'status', type: 'string', title: 'Status',
            options: { list: ['pending', 'approved', 'rejected'] },
            initialValue: 'pending',
          }),
          defineField({ name: 'suggestedAt', type: 'datetime', title: 'Suggested At' }),
        ],
        preview: {
          select: { name: 'item.name', by: 'suggestedByName', status: 'status' },
          prepare: ({ name, by, status }) => ({
            title: name ?? 'Suggestion',
            subtitle: `${by ?? 'Someone'} · ${status ?? 'pending'}`,
          }),
        },
      }],
    }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Created At' }),
    defineField({ name: 'updatedAt', type: 'datetime', title: 'Updated At' }),
  ],
  preview: {
    select: { title: 'name', country: 'country.name', from: 'dates.from' },
    prepare: ({ title, country, from }) => ({
      title: title ?? 'Untitled trip',
      subtitle: [country, from].filter(Boolean).join(' · '),
    }),
  },
})
