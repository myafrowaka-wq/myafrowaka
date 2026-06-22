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
    "country": country->{ name, "slug": slug.current },
    "city": city->{ name, "slug": slug.current },
    "nearbyCities": nearbyCities[]->{ name, "slug": slug.current },
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
