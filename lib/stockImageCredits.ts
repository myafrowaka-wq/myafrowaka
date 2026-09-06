// Session 2.4 — provenance record for the site's legacy stock photography.
//
// These 38 images were, until this session, hotlinked directly from
// images.unsplash.com (98 references across 23 files pointed at them). WDOS
// TOOLING is explicit — "Self-host every image. Do not hotlink." — and an
// audit found the concrete cost of ignoring that: 4 hotlinked photos were
// already dead on a site that had been signed off by eye. Every file below
// is now downloaded and served from /public/images/stock instead.
//
// This is the deliberate stopgap route from the Master Build Plan (Part 4,
// item 13, option d): "properly licensed and downloaded stock as a stopgap,
// self-hosted rather than hotlinked." The Unsplash License grants free use
// for commercial and non-commercial purposes without requiring the
// photographer's permission or credit — so self-hosting alone makes these
// properly licensed. What it does NOT do is make them "Africa explained by
// Africans" photography. They stay a stopgap. The real route (tourism-board
// partnerships, building toward commissioned in-country photography) is the
// owner's confirmed direction, and the Sanity attraction/post image pipeline
// (sourcedImage.ts) enforces real photographer/licence/source/alt-text
// records for everything that replaces these going forward.
//
// No photographer name is recorded here. Getting one honestly requires the
// Unsplash API (a real access key, which this project does not have) or the
// photo's own page URL (which cannot be derived from the CDN filename below
// — Unsplash uses a different ID scheme for page URLs than for CDN paths).
// Inventing a name to fill the field would be exactly the kind of
// fabrication this project's X-30 gate exists to stop. So: honestly blank,
// not fabricated, until a real API key or the real replacement photography
// arrives.

export interface StockImageCredit {
  id: string
  file: string
  sourceUrl: string
  license: 'Unsplash License'
  photographer: null
  note: string
}

const LEGACY_NOTE =
  'Legacy placeholder photography, self-hosted as a Session 2.4 stopgap. Pending replacement via tourism-board partnership or commissioned photography.'

const IDS = [
  '1513415277900-a62401e19be4',
  '1518882570151-157128e78fa1',
  '1531208853003-c1ec1b8a81d7',
  '1531872036218-4e8a6828e339',
  '1542729841-c5af4aed2152',
  '1544298903-35eee5a95b4d',
  '1558694440-03ade9215d7b',
  '1559833064-6f4573ec1ac9',
  '1563985336376-568060942b80',
  '1573497019418-b400bb3ab074',
  '1577455486223-089171b4572f',
  '1577948000111-9c970dfe3743',
  '1593351799227-75df2026356b',
  '1597212618440-806262de4f6b',
  '1614528767034-70de9fe166e0',
  '1618811308896-d279d72fdf4d',
  '1618828665011-0abd973f7bb8',
  '1635865897833-38bc0f8aee44',
  '1640005438758-861043e64aa5',
  '1644772088209-c71d5c59f719',
  '1664992960082-0ea299a9c53e',
  '1673624522244-8de0d50b8492',
  '1678042955980-c173f0460d0a',
  '1678714001094-ba90abd57fec',
  '1682773083896-95176d8aecf8',
  '1690975719788-c0cf5b5692de',
  '1713845784497-fe3d7ed176d8',
  '1727023663928-1772e2c7e679',
  '1736443830251-dda3cb6df76c',
  '1737276812695-a930ae18aec2',
  '1741850820849-1b63a5911606',
  '1741991110666-88115e724741',
  '1744604030401-b24c5975a574',
  '1746310783422-16df7622e7c9',
  '1746876269545-c23ecff55722',
  '1760681554227-d7aad73cd57f',
  '1776153380872-108ba14dc63d',
  '1782283849015-df78517d4765',
  '1674573606969-0b0403e6fce1',
  '1666837147745-1c9dea9908a4',
  '1665333048952-a3ee97714c6b',
]

export const STOCK_IMAGE_CREDITS: StockImageCredit[] = IDS.map(id => ({
  id,
  file: `/images/stock/${id}.jpg`,
  sourceUrl: `https://images.unsplash.com/photo-${id}`,
  license: 'Unsplash License',
  photographer: null,
  note: LEGACY_NOTE,
}))

/** Local, self-hosted path for a formerly-hotlinked Unsplash photo ID (the part after "photo-"). */
export function stockImage(id: string): string {
  return `/images/stock/${id}.jpg`
}

// Homepage hero background video — same self-hosting rule as every image
// above, and the same honesty bar: real, verified license, real credit.
// Sourced from Pexels (elephants walking through savanna grassland, by
// Roman Odintsov), confirmed free-to-use via the video's own published
// schema.org VideoObject metadata (isAccessibleForFree: true, license:
// pexels.com/license) before downloading. The Pexels License permits
// self-hosting for commercial use without attribution, but this project
// records real sourcing regardless of what's legally required, same as
// every photo credit above. Original was a 25s 4K clip; downloaded once,
// trimmed to the requested 10s and re-encoded at 1920px/~1.5Mbps (ffmpeg,
// H.264, muted, no re-hosting of the full original) — 1.9MB, reasonable
// for a homepage hero rather than serving a multi-tens-of-MB 4K file to
// every visitor.
export const HERO_VIDEO_CREDIT = {
  file: '/video/hero-savanna.mp4',
  sourceUrl: 'https://www.pexels.com/video/african-elephants-walking-in-a-grass-field-11760783/',
  license: 'Pexels License' as const,
  photographer: 'Roman Odintsov',
  note: 'Downloaded once, trimmed to 10s and re-encoded for web delivery — see comment above.',
}

// Session 6.3 (WDOS Performance gate) — a real frame extracted from the
// video above (ffmpeg, 00:00:02), used as its poster and, separately, to
// replace the 9 places across the site that were using ID
// '1531872036218-4e8a6828e339' — a graphic lion-kill photo — as a generic
// "represents Kenya / East Africa" image (that ID's actually-correct use,
// Maasai Mara National Reserve's own attraction page and a wildebeest-
// migration article, is left alone; predation is real, documented content
// for those two, not a mismatch). Same source video, same Pexels License,
// same photographer credit as HERO_VIDEO_CREDIT above — this is a still
// from that clip, not a separately-sourced asset.
export const HERO_SAVANNA_POSTER = 'hero-savanna-poster'

// ── Shared per-slug lookup maps ─────────────────────────────────────────────
// Before this session, both of these maps were copy-pasted independently into
// 8+ files (app/page.tsx, app/attractions/page.tsx, app/attractions/[slug],
// app/destinations/[slug], app/search, app/blog/[slug], app/user-dashboard,
// app/authors/[slug], components/BlogGrid.tsx) — each hotlinking Unsplash
// directly, each one a separate place a URL could drift out of sync with the
// others. Consolidated here as the single source of truth; every file below
// now imports from this module instead of keeping its own copy.

// Session 6.3 (WDOS Content Integrity gate, X-32) — same stale-slug bug as
// FALLBACK_GUIDES/FEATURED_ATTRACTIONS/QUICK_OVERVIEWS elsewhere: every
// key here predates the "-{country}" slug convention, so attractionStockImage()
// silently fell through to the generic default photo below for every one
// of these landmarks on their real, live pages. Renamed 8 keys to their
// real Published slug. Djemaa el-Fna, Volcanoes National Park, and Cape
// Point stay under their working-title key — each is still Draft-only in
// Sanity, so there's no live slug yet to rename to.
//
// Batch 2 (2026-09-06 UX audit) — 'maasai-mara-national-reserve' was the
// same X-32 bug, gone stale a second time: this attraction has since been
// Published under 'masai-mara-national-reserve-kenya' (single 'a', a
// "-kenya" suffix, neither of which matches the old key), so the site's
// single most-searched safari page was silently showing the generic
// default the whole time. Renamed. Also added two real, verified-content
// matches found while auditing every published attraction's image against
// this map: Nairobi and Cairo were both showing the generic default (a
// Tanzania savanna elephant) on a capital-city page — genuine mismatches,
// now pointing at real, identifiable skyline photos of each city.
export const ATTRACTION_IMAGE_IDS: Record<string, string> = {
  'pyramids-of-giza-egypt':                  '1736443830251-dda3cb6df76c',
  'serengeti-national-park-tanzania':        '1542729841-c5af4aed2152',
  'victoria-falls-zimbabwe':                 '1674573606969-0b0403e6fce1',
  'bwindi-impenetrable-forest-uganda':       '1673624522244-8de0d50b8492',
  'djemaa-el-fna-marrakech':           '1597212618440-806262de4f6b',
  'sossusvlei-and-deadvlei-namibia':         '1666837147745-1c9dea9908a4',
  'volcanoes-national-park-rwanda':    '1682773083896-95176d8aecf8',
  'cape-point-south-africa':           '1746876269545-c23ecff55722',
  'lalibela-rock-hewn-churches-ethiopia-att-0103': '1782283849015-df78517d4765',
  'masai-mara-national-reserve-kenya': '1531872036218-4e8a6828e339',
  'stone-town-zanzibar-tanzania':            '1678042955980-c173f0460d0a',
  'ngorongoro-crater-tanzania':               '1635865897833-38bc0f8aee44',
  'nairobi-kenya':                            '1741991110666-88115e724741',
  'cairo-egypt':                              '1746310783422-16df7622e7c9',
  // Genuinely the right building for the wrong Ghanaian city: this is
  // Black Star Square / Independence Arch in Accra (verified by sight —
  // the "BLACK STAR SQUA[RE]" lettering is legible on the arch itself),
  // not Cape Coast Castle 150km away. Reused here for Accra's own page,
  // which had the same generic-default mismatch; Cape Coast Castle stays
  // unmapped rather than force a wrong match — it still needs its own
  // real photo, flagged, not silently left showing a savanna photo
  // (that part of the bug is now at least visible instead of hidden).
  'accra-ghana':                              '1727023663928-1772e2c7e679',

  // Batch 2 (2026-09-06) — real Lagos attractions added after the owner's
  // Lagos trip-planner test found Nigeria had zero published attractions.
  // No dedicated per-venue photography exists yet, so these reuse the two
  // most Lagos-specific images already in the pool above: a Lagos Island
  // skyline (the same one used for Nigeria's own country card) for the two
  // Lagos-Island sites, and a Lagos mainland rooftop scene for the two
  // Lekki-area sites. Genuinely mismatched defaults (a savanna photo on an
  // art gallery page) would be worse than an honest reuse — see
  // COUNTRY_IMAGE_IDS's own comment on the same tradeoff. Real interior/
  // exterior photography for each venue is still a flagged gap, not
  // resolved by this mapping.
  'freedom-park-lagos-nigeria':               '1618828665011-0abd973f7bb8',
  'national-museum-lagos-nigeria':            '1618828665011-0abd973f7bb8',
  'nike-art-gallery-lagos-nigeria':           '1559833064-6f4573ec1ac9',
  'lekki-conservation-centre-lagos-nigeria':  '1673624522244-8de0d50b8492',
  'tarkwa-bay-beach-lagos-nigeria':           '1577455486223-089171b4572f',
}

/** Local, self-hosted cover image for an attraction slug (legacy placeholder pending real photography). */
export function attractionStockImage(slug: string): string {
  return stockImage(ATTRACTION_IMAGE_IDS[slug] ?? '1542729841-c5af4aed2152')
}

export const BLOG_COVER_IMAGE_IDS: Record<string, string> = {
  'lagos-rush-hour-city-life':              '1618828665011-0abd973f7bb8',
  'kumasi-central-market-west-africa':      '1776153380872-108ba14dc63d',
  'slow-travel-rwanda':                     '1682773083896-95176d8aecf8',
  'namib-desert-first-light':               '1666837147745-1c9dea9908a4',
  'west-africa-food-culture':               '1665333048952-a3ee97714c6b',
  'zanzibar-stone-town-doors':               '1678042955980-c173f0460d0a',
  'marrakech-djemaa-el-fna-guide':          '1597212618440-806262de4f6b',
  'victoria-falls-zimbabwe-guide':          '1674573606969-0b0403e6fce1',
  'maasai-mara-wildebeest-migration-kenya': '1531872036218-4e8a6828e339',
  'cape-town-winter-travel-guide':          '1746876269545-c23ecff55722',
  'addis-ababa-walking-guide':              '1782283849015-df78517d4765',
}

/** Local, self-hosted cover image for a blog post slug (legacy placeholder pending real photography). */
export function blogStockImage(slug: string): string {
  return stockImage(BLOG_COVER_IMAGE_IDS[slug] ?? '1682773083896-95176d8aecf8')
}

export const COUNTRY_IMAGE_IDS: Record<string, string> = {
  'egypt':         '1640005438758-861043e64aa5',
  // Session 6.3 (WDOS Performance gate) — real bug, caught by actually
  // looking at the rendered page: this ID is a lioness feeding on a
  // wildebeest carcass, not a generic Kenya tourism scene — graphic and
  // mismatched as this country's representative image (used on Kenya's
  // own destination page, region-page country cards, DestinationsGrid,
  // and Nav's East Africa thumbnail). Swapped for a real, verified,
  // accurately-described elephant-family photo — see
  // public/images/stock/hero-savanna-poster.jpg and HERO_VIDEO_CREDIT
  // above (same source, same license, a real extracted frame).
  'kenya':         'hero-savanna-poster',
  'south-africa':  '1744604030401-b24c5975a574',
  'tanzania':      '1635865897833-38bc0f8aee44',
  'morocco':       '1760681554227-d7aad73cd57f',
  'ghana':         '1727023663928-1772e2c7e679',
  'nigeria':       '1618828665011-0abd973f7bb8',
  'rwanda':        '1682773083896-95176d8aecf8',
  'ethiopia':      '1782283849015-df78517d4765',
  'uganda':        '1614528767034-70de9fe166e0',
  'senegal':       '1644772088209-c71d5c59f719',
  'zimbabwe':      '1618811308896-d279d72fdf4d',
  'namibia':       '1563985336376-568060942b80',
  'botswana':      '1531208853003-c1ec1b8a81d7',
  'madagascar':    '1558694440-03ade9215d7b',
  'tunisia':       '1737276812695-a930ae18aec2',
  'ivory-coast':   '1690975719788-c0cf5b5692de',
  'mozambique':    '1544298903-35eee5a95b4d',
  'zambia':        '1678714001094-ba90abd57fec',
  'mauritius':     '1513415277900-a62401e19be4',
}

/** Local, self-hosted cover image for a country slug (legacy placeholder pending real photography).
 *  Session 6.3 (WDOS Performance gate) — the fallback used to be a graphic
 *  lion-kill photo, meaning EVERY country not in the map above (most of
 *  them) silently got that as its representative image. Swapped for the
 *  real, verified elephant-family frame. */
export function countryStockImage(slug: string): string {
  return stockImage(COUNTRY_IMAGE_IDS[slug] ?? 'hero-savanna-poster')
}
