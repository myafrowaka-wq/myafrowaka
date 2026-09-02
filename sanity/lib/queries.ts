export const ATTRACTION_BY_SLUG_QUERY = `
  *[_type == "attraction" && slug.current == $slug && contentStatus == "Published"][0]{
    _id,
    attractionId,
    name,
    slug,
    subRegionProvince,
    continentRegion,
    latitude,
    longitude,
    type,
    unescoStatus,
    heritageEra,
    suitableFor,
    difficultyAccessLevel,
    entryFeeInternational,
    entryFeeLocal,
    entryFeeDisplayText,
    bestTimeToVisit,
    timeNeeded,
    gettingThere,
    nearestAirportIATA,
    nearestAirportDistanceKm,
    primaryBrandPillar,
    secondaryPillar,
    experienceTags,
    metaTitle,
    metaDescription,
    focusKeyword,
    secondaryKeywords,
    editorialSummary,
    googleMapsPlaceId,
    addressDirections,
    contentStatus,
    lastVerifiedDate,
    articleBody,
    "country": country->{ name, "slug": slug.current, countryCode, overview, whenToGo },
    "city": city->{ name, "slug": slug.current },
    "nearbyCities": nearbyCities[]->{ name, "slug": slug.current },
    "featuredIn": *[_type == "editorialPillar" && contentStatus == "Published" && references(^._id)]{
      title, "slug": slug.current
    },
    "countryAttractions": *[_type == "attraction" && country._ref == ^.country._ref && contentStatus == "Published" && slug.current != $slug][0..3]{
      name, "slug": slug.current, type, editorialSummary
    },
    // Session 5.2 — real partner links only; an attraction with none
    // simply renders no "Where to Stay" section (see affiliateLink.ts).
    // NOTE: deliberately not "affiliateLinks[]->{...}[active != false]" —
    // confirmed live that chaining a bracket filter directly after a
    // dereferenced projection silently returns an array of null for every
    // element rather than filtering anything. The _id-in-refs shape below
    // is the correct GROQ idiom for "dereference an array of references,
    // filtered by a field on the target document."
    "affiliateLinks": *[_type == "affiliateLink" && active != false && _id in ^.affiliateLinks[]._ref]{
      label, partnerName, linkType, "slug": slug.current
    },
    // Session 5.2 — "connect all backlinks... automatically based on the
    // data." Same country-match pattern countryAttractions above already
    // uses, extended to the two content types attraction pages had no link
    // to at all before this session.
    "nearbyEvents": *[_type == "event" && contentStatus == "Published" && references(^.country._ref)][0..2]{
      name, "slug": slug.current, category, heroImage, dateType, startDate, endDate, estimatedTiming, verificationStatus,
      "country": country->{ name, "slug": slug.current, countryCode }
    },
    "relatedArticles": *[_type == "post" && contentStatus == "Published" && featuredCountry._ref == ^.country._ref][0..2]{
      title, "slug": slug.current, excerpt, coverImage, category
    }
  }
`

export const ALL_PUBLISHED_SLUGS_QUERY = `
  *[_type == "attraction" && contentStatus == "Published"]{ "slug": slug.current }
`

export const COUNTRY_BY_SLUG_QUERY = `
  *[_type == "country" && slug.current == $slug][0]{
    name,
    slug,
    continentRegion,
    overview,
    flagEmoji,
    "attractions": *[_type == "attraction" && references(^._id) && contentStatus == "Published"]{
      name, "slug": slug.current, type, continentRegion, editorialSummary,
      "city": city->{ name }
    } | order(name asc)
  }
`

export const ALL_COUNTRY_SLUGS_QUERY = `
  *[_type == "country"]{ "slug": slug.current }
`

export const CITY_BY_SLUG_QUERY = `
  *[_type == "city" && slug.current == $slug][0]{
    name,
    slug,
    "country": country->{ name, "slug": slug.current, countryCode },
    overview,
    "attractions": *[_type == "attraction" && references(^._id) && contentStatus == "Published"]{
      name, "slug": slug.current, type, continentRegion, editorialSummary
    } | order(name asc),
    // Session 5.2 — "connect all backlinks... automatically based on the
    // data." Same city-first-then-country-fallback shape the event
    // template's own "nearbyAttractions" already uses (see
    // EVENT_BY_SLUG_QUERY above) — a city page had no link to events at
    // all before this session.
    // A bare array can't say whether these events are actually in this
    // city or just somewhere in the country — the page needs to know
    // which, so "Events in Alexandria" doesn't get shown for an event that
    // only matched the country-wide fallback.
    "eventsScope": select(
      count(*[_type == "event" && contentStatus == "Published" && references(^._id)]) > 0 => "city",
      "country"
    ),
    "upcomingEvents": select(
      count(*[_type == "event" && contentStatus == "Published" && references(^._id)]) > 0 =>
        *[_type == "event" && contentStatus == "Published" && references(^._id)][0..3]{
          name, "slug": slug.current, category
        },
      *[_type == "event" && contentStatus == "Published" && references(^.country._ref)][0..3]{
        name, "slug": slug.current, category
      }
    )
  }
`

export const ALL_CITY_SLUGS_QUERY = `
  *[_type == "city"]{ "slug": slug.current }
`

export const ALL_POSTS_QUERY = `
  *[_type == "post" && contentStatus == "Published"] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    category,
    tags,
    coverImage,
    "author": author->{ name, "slug": slug.current, bio, photo }
  }
`

export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug && contentStatus == "Published"][0] {
    title,
    "slug": slug.current,
    publishedAt,
    _updatedAt,
    excerpt,
    category,
    tags,
    coverImage,
    body,
    metaTitle,
    metaDescription,
    "author": author->{ name, "slug": slug.current, bio, photo },
    "featuredCountry": featuredCountry->{ name, "slug": slug.current },
    // Session 5.2 — "connect all backlinks... automatically based on the
    // data." A post had no link to specific attractions or events at all
    // before this session — only to its one featuredCountry. Both derived
    // from that same reference, same pattern as every other page this
    // session, not hand-picked per article.
    "relatedAttractions": *[_type == "attraction" && contentStatus == "Published" && references(^.featuredCountry._ref)][0..3]{
      name, "slug": slug.current, type, editorialSummary
    },
    "relatedEvents": *[_type == "event" && contentStatus == "Published" && references(^.featuredCountry._ref)][0..3]{
      name, "slug": slug.current, category
    }
  }
`

export const AUTHOR_BY_SLUG_QUERY = `
  *[_type == "author" && slug.current == $slug][0] {
    name,
    "slug": slug.current,
    bio,
    role,
    country,
    specialism,
    photo,
    socialLinks
  }
`

export const ALL_AUTHOR_SLUGS_QUERY = `
  *[_type == "author"]{ "slug": slug.current }
`

export const ALL_POST_SLUGS_QUERY = `
  *[_type == "post" && contentStatus == "Published"]{ "slug": slug.current }
`

export const ALL_GUIDES_QUERY = `
  *[_type == "editorialPillar" && contentStatus == "Published"] | order(title asc) {
    title,
    "slug": slug.current,
    focusKeyword,
    metaTitle,
    metaDescription,
    "itemCount": count(items)
  }
`

export const GUIDE_BY_SLUG_QUERY = `
  *[_type == "editorialPillar" && slug.current == $slug && contentStatus == "Published"][0] {
    title,
    "slug": slug.current,
    focusKeyword,
    metaTitle,
    metaDescription,
    "items": items[]{
      framingText,
      "attraction": attraction->{
        _id,
        name,
        "slug": slug.current,
        type,
        editorialSummary,
        continentRegion,
        lastVerifiedDate,
        "country": country->{ name, "slug": slug.current },
        "city": city->{ name }
      }
    }
  }
`

export const ALL_GUIDE_SLUGS_QUERY = `
  *[_type == "editorialPillar" && contentStatus == "Published"]{ "slug": slug.current }
`

export const ALL_ATTRACTIONS_QUERY = `
  *[_type == "attraction" && contentStatus == "Published"] | order(name asc) {
    name,
    "slug": slug.current,
    type,
    editorialSummary,
    "country": country->{ name, "slug": slug.current, countryCode },
    "city": city->{ name }
  }
`

// ── Events (Session 3.1 schema; consumed starting Session 3.2) ─────────────

export const EVENT_BY_SLUG_QUERY = `
  *[_type == "event" && slug.current == $slug && contentStatus == "Published"][0]{
    _id,
    eventId,
    name,
    localName,
    heroImage,
    shortDescription,
    fullDescription,
    category,
    experienceTags,
    dateType,
    startDate,
    endDate,
    estimatedTiming,
    isAnnual,
    verificationStatus,
    verifiedBy,
    verificationSourceUrl,
    verificationDate,
    cancelledNote,
    venue,
    addressDirections,
    latitude,
    longitude,
    scoreCulturalDepth,
    scoreInternationalAppeal,
    scoreMusic,
    scoreFood,
    scoreFamilySuitability,
    scoreAccessibility,
    scorePhotography,
    scoreTravelInfrastructure,
    scoringNotes,
    whatToExpect,
    safetyInfo,
    whatToWear,
    suggestedItinerary,
    gettingThere,
    whereToStay,
    costEstimate,
    nearestAirportIATA,
    suitableFor,
    culturalEtiquette,
    organizerName,
    organizerUrl,
    officialEventUrl,
    metaTitle,
    metaDescription,
    "country": country->{ name, "slug": slug.current, countryCode },
    "city": city->{ name, "slug": slug.current },
    // "What else is nearby" — derived, not manually curated, so it works
    // from day one without an editor having to hand-pick attractions for
    // every one of the first 100 events. Same city first; if the event has
    // no city reference or nothing published there yet, same country.
    "nearbyAttractions": select(
      defined(city) => *[_type == "attraction" && contentStatus == "Published" && references(^.city._ref)][0...4]{
        name, "slug": slug.current, editorialSummary, type,
        "city": city->{ name }
      },
      *[_type == "attraction" && contentStatus == "Published" && references(^.country._ref)][0...4]{
        name, "slug": slug.current, editorialSummary, type,
        "city": city->{ name }
      }
    ),
    "nearbyEvents": *[_type == "event" && contentStatus == "Published" && references(^.country._ref) && slug.current != $slug][0...3]{
      name, "slug": slug.current, category, heroImage, dateType, startDate, endDate, estimatedTiming, verificationStatus,
      "country": country->{ name, "slug": slug.current, countryCode },
      "city": city->{ name }
    },
    // Session 5.2 — real partner links only (see affiliateLink.ts). See
    // the attraction query's identical note above on why this is the
    // _id-in-refs shape and not "affiliateLinks[]->{...}[active != false]".
    "affiliateLinks": *[_type == "affiliateLink" && active != false && _id in ^.affiliateLinks[]._ref]{
      label, partnerName, linkType, "slug": slug.current
    },
    // Session 5.2 — "connect all backlinks... automatically based on the
    // data." Same country-match pattern as the attraction page.
    "relatedArticles": *[_type == "post" && contentStatus == "Published" && featuredCountry._ref == ^.country._ref][0..2]{
      title, "slug": slug.current, excerpt, category
    }
  }
`

export const ALL_EVENT_SLUGS_QUERY = `
  *[_type == "event" && contentStatus == "Published"]{ "slug": slug.current }
`

export const ALL_EVENTS_QUERY = `
  *[_type == "event" && contentStatus == "Published"] | order(startDate asc) {
    name,
    "slug": slug.current,
    heroImage,
    shortDescription,
    category,
    experienceTags,
    suitableFor,
    dateType,
    startDate,
    endDate,
    estimatedTiming,
    verificationStatus,
    "country": country->{ name, "slug": slug.current, countryCode, continentRegion },
    "city": city->{ name }
  }
`

export const ALL_EVENT_COLLECTION_SLUGS_QUERY = `
  *[_type == "eventCollection" && contentStatus == "Published"]{ "slug": slug.current }
`

export const EVENT_COLLECTION_BY_SLUG_QUERY = `
  *[_type == "eventCollection" && slug.current == $slug && contentStatus == "Published"][0]{
    title,
    "slug": slug.current,
    description,
    metaTitle,
    metaDescription,
    "items": items[]{
      framingText,
      "event": event->{
        name, "slug": slug.current, heroImage, shortDescription, category,
        experienceTags, suitableFor, dateType, startDate, endDate, estimatedTiming, verificationStatus,
        "country": country->{ name, "slug": slug.current, countryCode, continentRegion },
        "city": city->{ name }
      }
    }
  }
`

export const ALL_COUNTRIES_QUERY = `
  *[_type == "country"] | order(name asc){
    name, "slug": slug.current, countryCode, continentRegion
  }
`

// ── Region category pages ───────────────────────────────────────────────────
// "Region" isn't a Sanity document type of its own (see the fixed 6-value
// list in lib/regionColors.ts's REGION_COLOR) — these read the same
// country/post documents everything else does, filtered by the country's
// own continentRegion field.

// Session 6.3 (WDOS Content Integrity gate, X-32 — every link resolves) —
// same real bug and same fix as DESTINATION_BY_SLUG_QUERY's
// relatedCountries below: without a readiness filter, this region-listing
// page renders a card for every country in the region and links every one
// of them to /destinations/[slug], which 404s for any country with no
// overview and no published attractions.
export const COUNTRIES_BY_REGION_QUERY = `
  *[
    _type == "country" && continentRegion == $region &&
    (defined(overview) || count(*[_type == "attraction" && references(^._id) && contentStatus == "Published"]) > 0)
  ] | order(name asc){
    name, "slug": slug.current, countryCode, continentRegion, overview
  }
`

export const POSTS_BY_REGION_QUERY = `
  *[_type == "post" && contentStatus == "Published" && featuredCountry->continentRegion == $region]
    | order(publishedAt desc){
    title, "slug": slug.current, publishedAt, excerpt, category, coverImage,
    "countryName": featuredCountry->name
  }
`

export const DESTINATION_BY_SLUG_QUERY = `
  *[_type == "country" && slug.current == $slug][0]{
    name,
    slug,
    continentRegion,
    countryCode,
    overview,
    whenToGo,
    knownFor,
    surprises,
    gettingAround,
    visaInfo,
    safetyInfo,
    quickFacts,
    "startHereAttractions": startHereAttractions[]->{
      name, "slug": slug.current, type, editorialSummary,
      "city": city->{ name }
    },
    "attractions": *[_type == "attraction" && references(^._id) && contentStatus == "Published"]{
      name, "slug": slug.current, type, continentRegion, editorialSummary, lastVerifiedDate,
      "city": city->{ name }
    } | order(name asc),
    // Session 6.3 (WDOS Content Integrity gate, X-32 — every link resolves)
    // — real bug, found by crawling every link a live destination page
    // rendered: this had no readiness filter at all, so "Also in {region}"
    // could (and did — /destinations/egypt linked to Algeria/Libya/Sudan,
    // /destinations/kenya to Comoros/Eritrea) point at countries with zero
    // published attractions and no overview, which this same page's own
    // notFound() gate (attractions.length === 0 && !overview) then 404s.
    // Matches that exact condition here instead of reproducing a
    // separate, driftable copy of the rule.
    "relatedCountries": *[
      _type == "country" && continentRegion == ^.continentRegion && slug.current != $slug &&
      (defined(overview) || count(*[_type == "attraction" && references(^._id) && contentStatus == "Published"]) > 0)
    ][0..4]{
      name, "slug": slug.current, countryCode
    },
    // Session 5.2 — "connect all backlinks... automatically based on the
    // data." A country page had no link to events or articles at all
    // before this session, despite both already carrying a real country
    // reference.
    "upcomingEvents": *[_type == "event" && contentStatus == "Published" && references(^._id)][0..3]{
      name, "slug": slug.current, category, heroImage, dateType, startDate, endDate, estimatedTiming, verificationStatus,
      "country": country->{ name, "slug": slug.current, countryCode },
      "city": city->{ name }
    },
    "relatedArticles": *[_type == "post" && contentStatus == "Published" && featuredCountry._ref == ^._id][0..3]{
      title, "slug": slug.current, excerpt, category
    },
    // Real partner links tagged to this country (see affiliateLink.ts) —
    // used for a general "Where to Stay" widget, not tied to one specific
    // attraction.
    "affiliateLinks": *[_type == "affiliateLink" && active != false && country._ref == ^._id]{
      label, partnerName, linkType, "slug": slug.current
    },
    // Session 5.3 — the real outreach hook the plan describes only works
    // if the country page actually links to it; null (not an empty
    // object) when no published profile exists for this country yet.
    "tourismBoard": *[_type == "tourismBoard" && contentStatus == "Published" && country._ref == ^._id][0]{
      name, "slug": slug.current
    }
  }
`

// ── Trip planner (Session 4.2) ──────────────────────────────────────────────
// A lighter country projection than DESTINATION_BY_SLUG_QUERY — enough for
// the planner's country picker + inline overview, fetched for all 47
// countries up front (small at this scale) rather than a second round trip
// once one is picked, without pulling the longer destination-page-only
// fields (surprises, gettingAround, visaInfo, safetyInfo, quickFacts).
export const TRIP_PLANNER_COUNTRIES_QUERY = `
  *[_type == "country"] | order(name asc){
    name, "slug": slug.current, countryCode, continentRegion, overview, whenToGo, knownFor,
    // Session 5.2 — "in trip itineraries." Fetched inline with the other
    // 46 countries' worth of data the planner already pulls up front, same
    // "small at this scale" reasoning as the comment above this query.
    "affiliateLinks": *[_type == "affiliateLink" && active != false && country._ref == ^._id]{
      label, partnerName, linkType, "slug": slug.current
    }
  }
`

// ── Tourism boards (Session 5.3) ─────────────────────────────────────────
// "A quiet feature with a loud payoff" — a profile page per real tourism
// authority, and the real mechanism (verifiedEvents) behind "Verified by
// MyAfroWaka." Published-only, same gate as every other content type.
export const ALL_TOURISM_BOARD_SLUGS_QUERY = `
  *[_type == "tourismBoard" && contentStatus == "Published"]{ "slug": slug.current }
`

export const ALL_TOURISM_BOARDS_QUERY = `
  *[_type == "tourismBoard" && contentStatus == "Published"] | order(name asc){
    name, "slug": slug.current, coverage,
    "country": country->{ name, "slug": slug.current, countryCode }
  }
`

export const TOURISM_BOARD_BY_SLUG_QUERY = `
  *[_type == "tourismBoard" && slug.current == $slug && contentStatus == "Published"][0]{
    name, coverage, officialUrl, officialEventsCalendarUrl,
    pressContactName, pressContactEmail,
    "country": country->{ name, "slug": slug.current, countryCode },
    "verifiedEvents": verifiedEvents[]->{
      name, "slug": slug.current, category, dateType, startDate, endDate, estimatedTiming, verificationStatus
    }
  }
`

// ── Newsletter (Session 5.1) ─────────────────────────────────────────────
// Needs _id (unlike ALL_COUNTRIES_QUERY above) since the signup form writes
// a real reference to newsletterSubscriber.homeCountry, not just a slug.
export const NEWSLETTER_COUNTRIES_QUERY = `
  *[_type == "country"] | order(name asc){
    _id, name, "slug": slug.current, countryCode
  }
`
