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
    "country": country->{ name, "slug": slug.current },
    overview,
    "attractions": *[_type == "attraction" && references(^._id) && contentStatus == "Published"]{
      name, "slug": slug.current, type, continentRegion, editorialSummary
    } | order(name asc)
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
    "featuredCountry": featuredCountry->{ name, "slug": slug.current }
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

export const ALL_COUNTRIES_QUERY = `
  *[_type == "country"] | order(name asc){
    name, "slug": slug.current, countryCode, continentRegion
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
    "relatedCountries": *[_type == "country" && continentRegion == ^.continentRegion && slug.current != $slug][0..4]{
      name, "slug": slug.current, countryCode
    }
  }
`
