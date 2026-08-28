/**
 * Single source of truth for region, country and content-category accent
 * colours. (Filename predates the category map being added — kept as-is
 * to avoid touching every import path a second time; the exports below
 * are what matters.)
 *
 * Before Session 1.1 this exact 6-entry object was copy-pasted, in raw
 * hex, into 7 separate files (cities, destinations, guides and search
 * pages, AfricaMap, Nav, DestinationsGrid) — the definition of a value
 * that can't be re-themed, because changing a colour meant finding and
 * editing it in seven places and hoping none were missed.
 *
 * Values are read from the CSS custom properties defined in
 * app/globals.css (--color-region-*, --color-country-*), which are
 * themselves references to the brand's core five colours. Nothing here
 * is a new hue — see globals.css for the reasoning behind each one.
 */

export const REGION_COLOR: Record<string, string> = {
  'North Africa':         'var(--color-region-north)',
  'West Africa':          'var(--color-region-west)',
  'East Africa':          'var(--color-region-east)',
  'Central Africa':       'var(--color-region-central)',
  'Southern Africa':      'var(--color-region-south)',
  'Indian Ocean Islands': 'var(--color-region-islands)',
}

/** Fallback when a record's continentRegion field is missing or unrecognised. */
export const REGION_COLOR_FALLBACK = 'var(--color-region-west)'

/** Same duplication problem, same fix — this exact object was copy-pasted
 *  into 3 files (BlogGrid, the blog post page, the author page). */
export const CATEGORY_COLOR: Record<string, string> = {
  'Destinations':       'var(--color-ochre)',
  'Culture & Heritage': 'var(--color-moss)',
  'Travel Planning':    'var(--color-crimson)',
  'Food Tourism':       'var(--color-gold)',
  'Experiences':        'var(--color-slate)',
}

export const CATEGORY_COLOR_FALLBACK = 'var(--color-ochre)'

/** Session 3.2 — the 7 event categories, mapped onto the same restrained
 *  5-colour core brand palette rather than inventing a 6th or 7th hue.
 *  Only 5 named "core brand" swatches exist (ochre/gold/moss/crimson/
 *  charcoal) by design — see the "Core brand" section of globals.css.
 *  With 7 categories to cover, National Celebrations and Tourism Industry
 *  deliberately share slate: they're the two institutional/governmental
 *  categories, the least likely pair to be visually confused with each
 *  other or with the vibrant cultural/artistic categories in an unfiltered
 *  grid. Food and Drink reuses gold to stay consistent with the blog's
 *  existing Food Tourism = gold mapping above. */
export const EVENT_CATEGORY_COLOR: Record<string, string> = {
  'Music':                    'var(--color-crimson)',
  'Food and Drink':           'var(--color-gold)',
  'Cultural':                 'var(--color-moss)',
  'Religious and Spiritual':  'var(--color-charcoal)',
  'Arts / Film / Fashion':    'var(--color-ochre)',
  'National Celebrations':    'var(--color-slate)',
  'Tourism Industry':         'var(--color-slate)',
}

export const EVENT_CATEGORY_COLOR_FALLBACK = 'var(--color-slate)'

/** Semantic, not decorative — deliberately separate from the accent hues
 *  above. This is the frontend half of "an unverified date never displays
 *  as a fact": the verification badge always uses one of these four
 *  colours, never a category colour, so a viewer can tell trust level at
 *  a glance regardless of which category they're looking at. */
export const VERIFICATION_STATUS_COLOR: Record<string, string> = {
  'Verified':                 'var(--color-moss)',
  'Date to be confirmed':     'var(--color-gold)',
  'Annual, dates vary':       'var(--color-slate)',
  'Cancelled or postponed':   'var(--color-crimson)',
}

export const COUNTRY_COLOR: Record<string, string> = {
  'Egypt':        'var(--color-country-egypt)',
  'Kenya':        'var(--color-country-kenya)',
  'South Africa': 'var(--color-country-south-africa)',
  'Tanzania':     'var(--color-country-tanzania)',
  'Morocco':      'var(--color-country-morocco)',
  'Ghana':        'var(--color-country-ghana)',
  'Nigeria':      'var(--color-country-nigeria)',
  'Rwanda':       'var(--color-country-rwanda)',
  'Ethiopia':     'var(--color-country-ethiopia)',
  'Uganda':       'var(--color-country-uganda)',
  'Senegal':      'var(--color-country-senegal)',
  'Zimbabwe':     'var(--color-country-zimbabwe)',
  'Namibia':      'var(--color-country-namibia)',
  'Botswana':     'var(--color-country-botswana)',
  'Madagascar':   'var(--color-country-madagascar)',
  'Tunisia':      'var(--color-country-tunisia)',
  'Ivory Coast':  'var(--color-country-ivory-coast)',
  'Mozambique':   'var(--color-country-mozambique)',
  'Zambia':       'var(--color-country-zambia)',
  'Mauritius':    'var(--color-country-mauritius)',
}
