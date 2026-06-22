import { createClient } from '@sanity/client'
import XLSX from 'xlsx'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: 'k2ysdc2b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const EXCEL_PATH = resolve(__dirname, '../../../01-Database/MyAfroWaka_Master_Attraction_Database_v2_2 (Recovered).xlsx')

function parsePipe(val) {
  if (!val || typeof val !== 'string') return []
  return val.split('|').map(s => s.trim()).filter(Boolean)
}

function toSlug(val) {
  if (!val || typeof val !== 'string') return ''
  return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)
}

function toNum(val) {
  const n = parseFloat(val)
  return isNaN(n) ? undefined : n
}

function toDate(val) {
  if (!val) return undefined
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    if (!d) return undefined
    return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
  }
  const s = String(val).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return undefined
}

async function main() {
  console.log('Reading Excel file...')
  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheet = workbook.Sheets['MASTER DATABASE']

  // Row 1 = title, Row 2 = category headers, Row 3 = column names, Row 4+ = data
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  const headers = raw[2]  // Row 3 (index 2) has the actual column names
  const dataRows = raw.slice(3).filter(r => r[0] && String(r[0]).startsWith('ATT-'))

  // Map rows to objects using the real headers
  const rows = dataRows.map(r => {
    const obj = {}
    headers.forEach((h, i) => { if (h) obj[h] = r[i] ?? '' })
    return obj
  })

  console.log(`Found ${rows.length} attraction rows`)

  // Column name shortcuts
  const C = {
    id:           'Attraction ID',
    slug:         'URL Slug',
    name:         'Attraction Name',
    country:      'Country',
    province:     'Sub-Region / Province',
    city:         'City',
    nearbyCities: 'Nearby Cities (pipe-sep)',
    region:       'Continent Region',
    lat:          'Latitude',
    lng:          'Longitude',
    type:         'Type',
    unesco:       'UNESCO Status',
    heritage:     'Heritage Era',
    suitableFor:  'Suitable For',
    difficulty:   'Difficulty / Access Level',
    feeIntl:      'Entry Fee — Intl (USD equiv)',
    feeLocal:     'Entry Fee — Local/Resident',
    feeText:      'Entry Fee Display Text',
    bestTime:     'Best Time to Visit',
    timeNeeded:   'Time Needed (hrs)',
    gettingThere: 'Getting There',
    airportIATA:  'Nearest Airport (IATA)',
    airportDist:  'Nearest Airport Dist (km)',
    pillar1:      'Primary Brand Pillar',
    pillar2:      'Secondary Pillar',
    expTags:      'Experience Tags',
    metaTitle:    'Meta Title (≤60)',
    metaDesc:     'Meta Description (≤160)',
    focusKw:      'Focus Keyword',
    secKw:        'Secondary Keywords',
    summary:      'Editorial Summary',
    placeId:      'Google Maps Place ID',
    address:      'Address / Directions',
    status:       'Content Status',
    verified:     'Last Verified Date',
    sourceFile:   'Source File',
  }

  const str = (row, col) => String(row[col] || '').trim()

  // ── 1. Create unique countries ──────────────────────────────────────────────
  const countryMap = {}
  for (const row of rows) {
    const name = str(row, C.country)
    const region = str(row, C.region)
    if (name && !countryMap[name]) countryMap[name] = { name, region }
  }

  console.log(`Creating ${Object.keys(countryMap).length} countries...`)
  const countryIds = {}
  for (const [name, data] of Object.entries(countryMap)) {
    const slug = toSlug(name)
    await client.createOrReplace({
      _type: 'country',
      _id: `country-${slug}`,
      name: data.name,
      slug: { _type: 'slug', current: slug },
      continentRegion: data.region || undefined,
    })
    countryIds[name] = `country-${slug}`
  }
  console.log('Countries done.')

  // ── 2. Create unique cities ─────────────────────────────────────────────────
  const cityMap = {}
  for (const row of rows) {
    const name = str(row, C.city)
    const countryName = str(row, C.country)
    if (name && !cityMap[name]) cityMap[name] = { name, countryName }
  }

  console.log(`Creating ${Object.keys(cityMap).length} cities...`)
  const cityIds = {}
  for (const [name, data] of Object.entries(cityMap)) {
    const slug = toSlug(name)
    const countryId = countryIds[data.countryName]
    await client.createOrReplace({
      _type: 'city',
      _id: `city-${slug}`,
      name: data.name,
      slug: { _type: 'slug', current: slug },
      ...(countryId ? { country: { _type: 'reference', _ref: countryId } } : {}),
    })
    cityIds[name] = `city-${slug}`
  }
  console.log('Cities done.')

  // ── 3. Create attractions ───────────────────────────────────────────────────
  console.log(`Creating ${rows.length} attractions...`)
  let count = 0
  for (const row of rows) {
    const name = str(row, C.name)
    if (!name) continue

    const attractionId = str(row, C.id)
    const slugVal = str(row, C.slug) || toSlug(`${name}-${str(row, C.city)}-${str(row, C.country)}`)
    const countryId = countryIds[str(row, C.country)]
    const cityId = cityIds[str(row, C.city)]

    const nearbyCityRefs = parsePipe(str(row, C.nearbyCities))
      .map(c => cityIds[c])
      .filter(Boolean)
      .map(id => ({ _type: 'reference', _ref: id, _key: id }))

    const doc = {
      _type: 'attraction',
      _id: `attraction-${attractionId || toSlug(name)}`,
      attractionId: attractionId || undefined,
      slug: { _type: 'slug', current: slugVal },
      name,
      ...(countryId ? { country: { _type: 'reference', _ref: countryId } } : {}),
      subRegionProvince: str(row, C.province) || undefined,
      ...(cityId ? { city: { _type: 'reference', _ref: cityId } } : {}),
      ...(nearbyCityRefs.length ? { nearbyCities: nearbyCityRefs } : {}),
      continentRegion: str(row, C.region) || undefined,
      latitude: toNum(row[C.lat]),
      longitude: toNum(row[C.lng]),
      type: parsePipe(str(row, C.type)),
      unescoStatus: str(row, C.unesco) || undefined,
      heritageEra: parsePipe(str(row, C.heritage)),
      suitableFor: parsePipe(str(row, C.suitableFor)),
      difficultyAccessLevel: str(row, C.difficulty) || undefined,
      entryFeeInternational: toNum(row[C.feeIntl]),
      entryFeeLocal: toNum(row[C.feeLocal]),
      entryFeeDisplayText: str(row, C.feeText) || undefined,
      bestTimeToVisit: str(row, C.bestTime) || undefined,
      timeNeeded: toNum(row[C.timeNeeded]),
      gettingThere: str(row, C.gettingThere) || undefined,
      nearestAirportIATA: str(row, C.airportIATA) || undefined,
      nearestAirportDistanceKm: toNum(row[C.airportDist]),
      primaryBrandPillar: str(row, C.pillar1) || undefined,
      secondaryPillar: str(row, C.pillar2) || undefined,
      experienceTags: parsePipe(str(row, C.expTags)),
      metaTitle: str(row, C.metaTitle) || undefined,
      metaDescription: str(row, C.metaDesc) || undefined,
      focusKeyword: str(row, C.focusKw) || undefined,
      secondaryKeywords: str(row, C.secKw) || undefined,
      editorialSummary: str(row, C.summary) || undefined,
      googleMapsPlaceId: str(row, C.placeId) || undefined,
      addressDirections: str(row, C.address) || undefined,
      contentStatus: str(row, C.status) || 'Draft',
      lastVerifiedDate: toDate(row[C.verified]),
      sourceFile: str(row, C.sourceFile) || undefined,
    }

    // Remove undefined values
    Object.keys(doc).forEach(k => { if (doc[k] === undefined) delete doc[k] })

    await client.createOrReplace(doc)
    count++
    if (count % 50 === 0) console.log(`  ${count}/${rows.length} done...`)
  }

  console.log(`\nImport complete! ${count} attractions, ${Object.keys(countryIds).length} countries, ${Object.keys(cityIds).length} cities.`)
}

main().catch(err => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
