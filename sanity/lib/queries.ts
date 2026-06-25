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
    "featuredIn": *[_type == "editorialPillar" && contentStatus == "Published" && references(^._id)]{
      title, "slug": slug.current
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
    "author": author->{ name }
  }
`

export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug && contentStatus == "Published"][0] {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    category,
    tags,
    coverImage,
    body,
    metaTitle,
    metaDescription,
    "author": author->{ name },
    "featuredCountry": featuredCountry->{ name, "slug": slug.current }
  }
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

export const DESTINATION_BY_SLUG_QUERY = `
  *[_type == "country" && slug.current == $slug][0]{
    name,
    slug,
    continentRegion,
    overview,
    quickFacts,
    flagEmoji,
    "attractions": *[_type == "attraction" && references(^._id) && contentStatus == "Published"]{
      name, "slug": slug.current, type, continentRegion, editorialSummary, lastVerifiedDate,
      "city": city->{ name }
    } | order(name asc),
    "relatedCountries": *[_type == "country" && continentRegion == ^.continentRegion && slug.current != $slug][0..4]{
      name, "slug": slug.current, flagEmoji
    }
  }
`
