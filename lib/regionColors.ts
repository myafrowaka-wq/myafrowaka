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
