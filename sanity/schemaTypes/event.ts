import { defineField, defineType } from 'sanity'

// Session 3.1 — the events data model.
//
// The plan (Master Build Plan, Session 3.1) calls for "roughly 35 fields...
// modelled on the field list from your ChatGPT conversation." That
// conversation isn't in this project anywhere I could find (checked
// 03-Project/plan, briefs/, 01-Database/, 04-Docs/) — so this schema is
// built from what the plan itself specifies explicitly: the four-state
// verification system, the seven categories, the four date types, and the
// mandatory cultural-etiquette field, structured the same way attraction.ts
// is (grouped fields, an EVT-XXXX record ID, the same ops/SEO discipline) so
// the two content types are siblings, not strangers. It is not a literal
// reproduction of a source document I never had access to.
//
// The verification system is the actual product, not a content field like
// any other: "an unverified date never displays as a fact" is a frontend
// rendering rule (Session 3.2/3.3's job), but the schema is built so that
// rule is easy to honour — dateType and verificationStatus are separate
// axes on purpose, and the fields that make a false-certainty date possible
// (startDate/endDate) are visually de-emphasised in Studio unless dateType
// is actually Fixed.

const categories = [
  'Music',
  'Food and Drink',
  'Cultural',
  'Religious and Spiritual',
  'Arts / Film / Fashion',
  'National Celebrations',
  'Tourism Industry',
].map(c => ({ title: c, value: c }))

const verificationStatuses = [
  { title: 'Verified — checked against an official source', value: 'Verified' },
  { title: 'Date to be confirmed', value: 'Date to be confirmed' },
  { title: 'Annual, dates vary', value: 'Annual, dates vary' },
  { title: 'Cancelled or postponed', value: 'Cancelled or postponed' },
]

const dateTypes = [
  { title: 'Fixed (Gregorian calendar date)', value: 'Fixed' },
  { title: 'Lunar (Islamic calendar — moves ~11 days earlier each year)', value: 'Lunar' },
  { title: 'Ethiopian calendar', value: 'Ethiopian' },
  { title: 'Varies (no single predictable date)', value: 'Varies' },
]

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  groups: [
    { name: 'record', title: 'Record ID' },
    { name: 'identity', title: 'Identity' },
    { name: 'dates', title: 'Dates' },
    { name: 'verification', title: 'Verification' },
    { name: 'geography', title: 'Geography' },
    { name: 'experience', title: 'MyAfroWaka Experience Score' },
    { name: 'onTheGround', title: 'On the Ground' },
    { name: 'logistics', title: 'Travel Logistics' },
    { name: 'cultural', title: 'Cultural Etiquette' },
    { name: 'organizer', title: 'Organizer / Source' },
    { name: 'seo', title: 'SEO' },
    { name: 'ops', title: 'Ops' },
  ],
  fields: [
    // ─── RECORD ID ───────────────────────────────────────────────────────────
    defineField({
      name: 'eventId',
      title: 'Event ID',
      type: 'string',
      group: 'record',
      description: 'Format: EVT-XXXX. Sequential, zero-padded. Never reuse.',
      validation: r => r.regex(/^EVT-\d{4}$/, { name: 'EVT-XXXX format' }),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'record',
      description: 'Pattern: {event-name}-{country}. Lowercase, hyphens only. Permanent once published.',
      options: { source: 'name' },
      validation: r => r.required(),
    }),

    // ─── IDENTITY ────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Event Name',
      type: 'string',
      group: 'identity',
      description: 'Official English name (or the commonly used English name).',
      validation: r => r.required(),
    }),
    defineField({
      name: 'localName',
      title: 'Local / Original Name',
      type: 'string',
      group: 'identity',
      description: 'Optional. The name in the local language, if different (e.g. Grand Magal de Touba).',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'sourcedImage',
      group: 'identity',
      description: 'Required before publishing — same rule as attraction photos (X-13 / X-30).',
      validation: r => r.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      group: 'identity',
      description: '2-3 sentences. Used on listing cards and as the Event schema.org description. What it is and why it matters.',
      validation: r => r.max(280),
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'identity',
      description: 'The full "what it is and why it matters" section of the event page.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'identity',
      options: { list: categories },
      description: 'National Celebrations gets its own simpler listing card in Session 3.2 — fixed, one-day, governmental events do not behave like a five-day music festival.',
      validation: r => r.required(),
    }),
    defineField({
      name: 'experienceTags',
      title: 'Experience Tags',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'identity',
      description: 'Specific tags for faceted search and internal linking, e.g. "Jazz", "Harvest", "Pilgrimage".',
      options: { layout: 'tags' },
    }),

    // ─── DATES ───────────────────────────────────────────────────────────────
    defineField({
      name: 'dateType',
      title: 'Date Type',
      type: 'string',
      group: 'dates',
      options: { list: dateTypes },
      description: 'A Gregorian date field cannot honestly hold a lunar or Ethiopian-calendar event. Pick the real basis for this event\'s date before filling in the fields below.',
      validation: r => r.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      group: 'dates',
      description: 'Only fill in if Date Type is Fixed and the date is Verified. Otherwise use Estimated Timing below — do not put a guessed date here.',
      hidden: ({ document }) => document?.dateType !== 'Fixed',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      group: 'dates',
      description: 'Leave blank for a one-day event.',
      hidden: ({ document }) => document?.dateType !== 'Fixed',
    }),
    defineField({
      name: 'estimatedTiming',
      title: 'Estimated Timing',
      type: 'string',
      group: 'dates',
      description: 'The honest, non-committal display text for a Lunar/Ethiopian/Varies event, e.g. "Expected late March 2027, confirmed locally nearer the time." This is what the frontend shows instead of a fabricated exact date.',
      hidden: ({ document }) => document?.dateType === 'Fixed',
    }),
    defineField({
      name: 'isAnnual',
      title: 'Annual Event',
      type: 'boolean',
      group: 'dates',
      initialValue: true,
    }),

    // ─── VERIFICATION ────────────────────────────────────────────────────────
    defineField({
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      group: 'verification',
      options: { list: verificationStatuses },
      description: 'The heart of the product. An unverified date must never be displayed as if it were a fact.',
      initialValue: 'Date to be confirmed',
      validation: r => r.required(),
    }),
    defineField({
      name: 'verifiedBy',
      title: 'Verified By',
      type: 'string',
      group: 'verification',
      description: 'Who or what confirmed this — a named tourism board, ministry, or organiser. Not "the internet."',
      hidden: ({ document }) => document?.verificationStatus !== 'Verified',
    }),
    defineField({
      name: 'verificationSourceUrl',
      title: 'Verification Source URL',
      type: 'url',
      group: 'verification',
      description: 'The official page or document that confirms the date. This is the paper trail — "verified by MyAfroWaka" needs to be checkable.',
      hidden: ({ document }) => document?.verificationStatus !== 'Verified',
    }),
    defineField({
      name: 'verificationDate',
      title: 'Verification Date',
      type: 'date',
      group: 'verification',
      description: 'When this was last checked against the source above. Verification goes stale — this is how an editor knows when to recheck.',
    }),
    defineField({
      name: 'cancelledNote',
      title: 'Cancelled / Postponed Note',
      type: 'text',
      rows: 2,
      group: 'verification',
      description: 'What happened and, if known, what replaces it.',
      hidden: ({ document }) => document?.verificationStatus !== 'Cancelled or postponed',
    }),

    // ─── GEOGRAPHY ───────────────────────────────────────────────────────────
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
      group: 'geography',
      validation: r => r.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{ type: 'city' }],
      group: 'geography',
    }),
    defineField({
      name: 'venue',
      title: 'Venue / Location Name',
      type: 'string',
      group: 'geography',
      description: 'e.g. "Kejetia Market" or "Streets of Osogbo" — not always a single indoor venue.',
    }),
    defineField({
      name: 'addressDirections',
      title: 'Address / Directions',
      type: 'text',
      rows: 2,
      group: 'geography',
    }),
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      group: 'geography',
      description: '6 decimal places. Source: Google Maps.',
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      group: 'geography',
    }),

    // ─── MYAFROWAKA EXPERIENCE SCORE ────────────────────────────────────────
    // Session 3.3, "Added in v1.1" per the plan: the one piece of the events
    // product a competitor cannot copy by scraping, because it is a
    // documented editorial judgement, not a fact pulled off an official
    // page. All 8 optional at the schema level — an editor can start a
    // draft before scoring is done — but the frontend only ever renders the
    // rollup once every single one is actually filled in. A 5-of-8-filled
    // "score" presented as complete would be its own quiet fabrication.
    // The published rubric defining what each number means lives at
    // /events/experience-score, linked from every event page that shows a
    // score, so "documented" is a real, checkable claim.
    defineField({
      name: 'scoreCulturalDepth',
      title: 'Cultural Depth (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scoreInternationalAppeal',
      title: 'International Appeal (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scoreMusic',
      title: 'Music (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scoreFood',
      title: 'Food (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scoreFamilySuitability',
      title: 'Family Suitability (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scoreAccessibility',
      title: 'Accessibility (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scorePhotography',
      title: 'Photography (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scoreTravelInfrastructure',
      title: 'Travel Infrastructure (1-5)',
      type: 'number',
      group: 'experience',
      validation: r => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'scoringNotes',
      title: 'Scoring Notes',
      type: 'text',
      rows: 3,
      group: 'experience',
      description: 'Optional: the editorial reasoning behind these numbers, in case a reader or a future editor asks why.',
    }),

    // ─── ON THE GROUND ───────────────────────────────────────────────────────
    defineField({
      name: 'whatToExpect',
      title: 'What to Expect',
      type: 'text',
      rows: 4,
      group: 'onTheGround',
      description: 'The atmosphere, the crowd size, the pace of the day — what a first-time visitor should actually expect to walk into.',
    }),
    defineField({
      name: 'safetyInfo',
      title: 'Safety',
      type: 'text',
      rows: 4,
      group: 'onTheGround',
      description: 'Crowd safety, valuables, any real advisory relevant to this specific event — not generic travel-safety filler. Include [VERIFY] and a source where a claim is time-sensitive.',
    }),
    defineField({
      name: 'whatToWear',
      title: 'What to Wear',
      type: 'text',
      rows: 3,
      group: 'onTheGround',
      description: 'Practical guidance, and any dress requirement tied to the venue or occasion (distinct from Cultural Etiquette below, which covers conduct and access rules, not clothing).',
    }),
    defineField({
      name: 'suggestedItinerary',
      title: 'Suggested Itinerary',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'onTheGround',
      description: 'A short, real suggested plan for building a trip around this event — not required, but where it exists it should be specific (day 1 / day 2, not generic advice).',
    }),

    // ─── TRAVEL LOGISTICS ────────────────────────────────────────────────────
    defineField({
      name: 'gettingThere',
      title: 'Getting There',
      type: 'text',
      rows: 3,
      group: 'logistics',
    }),
    defineField({
      name: 'whereToStay',
      title: 'Where to Stay',
      type: 'text',
      rows: 3,
      group: 'logistics',
      description: 'Editorial narrative — which neighborhood, why. Pair with real booking links below rather than instead of them.',
    }),
    defineField({
      // Session 5.2 — "on event pages under accommodation." Same
      // affiliateLink reference pattern as attraction.ts.
      name: 'affiliateLinks',
      title: 'Where to Stay — Affiliate Links',
      type: 'array',
      group: 'logistics',
      description: 'Real partner links only. Empty is the honest default until a real one exists.',
      of: [{ type: 'reference', to: [{ type: 'affiliateLink' }] }],
    }),
    defineField({
      name: 'costEstimate',
      title: 'Cost Estimate',
      type: 'text',
      rows: 2,
      group: 'logistics',
      description: 'Entry cost, and roughly what a visit costs end to end, in local currency with year. Include [VERIFY] where unconfirmed.',
    }),
    defineField({
      name: 'nearestAirportIATA',
      title: 'Nearest Airport IATA Code',
      type: 'string',
      group: 'logistics',
      validation: r => r.max(3).uppercase(),
    }),
    defineField({
      name: 'suitableFor',
      title: 'Suitable For',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'logistics',
      options: {
        list: [
          'Solo Travelers', 'Couples', 'Families', 'Backpackers',
          'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
        ].map(t => ({ title: t, value: t })),
      },
    }),

    // ─── CULTURAL ETIQUETTE ──────────────────────────────────────────────────
    defineField({
      name: 'culturalEtiquette',
      title: 'Cultural Etiquette',
      type: 'text',
      rows: 5,
      group: 'cultural',
      description:
        'Mandatory on every event, not optional. Many of these events are religious or sacred — some restrict photography, some have rules about who may enter which space. A site that claims to explain Africa cannot send a visitor into a sacred space without telling them the rules first. This is a brand obligation, not a content nicety.',
      validation: r => r.required().min(20),
    }),

    // ─── ORGANIZER / SOURCE ──────────────────────────────────────────────────
    defineField({
      name: 'organizerName',
      title: 'Organizer Name',
      type: 'string',
      group: 'organizer',
      description: 'The tourism board, ministry, or named organiser behind this event. "Verification by authority, not by crowd" is the whole differentiator — this field is that authority, named.',
    }),
    defineField({
      name: 'organizerUrl',
      title: 'Organizer URL',
      type: 'url',
      group: 'organizer',
    }),
    defineField({
      name: 'officialEventUrl',
      title: 'Official Event Website',
      type: 'url',
      group: 'organizer',
    }),

    // ─── SEO ─────────────────────────────────────────────────────────────────
    defineField({ name: 'metaTitle',       title: 'Meta Title',       type: 'string', group: 'seo', validation: r => r.max(65) }),
    defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text',   group: 'seo', rows: 3, validation: r => r.max(160) }),
    defineField({ name: 'focusKeyword',    title: 'Focus Keyword',    type: 'string', group: 'seo' }),
    defineField({
      name: 'secondaryKeywords',
      title: 'Secondary Keywords',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Pipe-separated phrases.',
    }),

    // ─── OPS ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'contentStatus',
      title: 'Content Status',
      type: 'string',
      group: 'ops',
      options: {
        list: [
          { title: 'Draft', value: 'Draft' },
          { title: 'Needs Update', value: 'Needs Update' },
          { title: 'Incomplete', value: 'Incomplete' },
          { title: 'Published', value: 'Published' },
          { title: 'Archived', value: 'Archived' },
        ],
      },
      description:
        'This is the record\'s general publish state — deliberately has no "Verified" option, unlike attraction.ts\'s equivalent field. That word already means something specific and load-bearing here: Verification Status above, about whether the date can be trusted. Reusing it here would let a record read as "Verified" in two different, uncoordinated senses at once.',
      initialValue: 'Draft',
      validation: r => r.required(),
    }),
    defineField({
      name: 'sourceFile',
      title: 'Source File',
      type: 'string',
      group: 'ops',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'verificationStatus',
      media: 'heroImage.image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Event',
        subtitle: subtitle ? `Verification: ${subtitle}` : 'Verification: Date to be confirmed',
        media,
      }
    },
  },
})
