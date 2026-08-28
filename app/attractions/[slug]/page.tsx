import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from 'next-sanity'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ATTRACTION_BY_SLUG_QUERY, ALL_PUBLISHED_SLUGS_QUERY } from '@/sanity/lib/queries'
import { Badge } from '@/components/Badge'
import { FaqAccordion } from '@/components/FaqAccordion'
import { SaveButton } from '@/components/SaveButton'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { Flag } from '@/components/Flag'
import { attractionStockImage } from '@/lib/stockImageCredits'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Attraction {
  _id: string
  attractionId?: string
  name: string
  slug: { current: string }
  subRegionProvince?: string
  continentRegion?: string
  latitude?: number
  longitude?: number
  type?: string[]
  unescoStatus?: string
  heritageEra?: string[]
  suitableFor?: string[]
  difficultyAccessLevel?: string
  entryFeeInternational?: number
  entryFeeLocal?: number
  entryFeeDisplayText?: string
  bestTimeToVisit?: string
  timeNeeded?: number
  gettingThere?: string
  nearestAirportIATA?: string
  nearestAirportDistanceKm?: number
  primaryBrandPillar?: string
  secondaryPillar?: string
  experienceTags?: string[]
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  secondaryKeywords?: string
  editorialSummary?: string
  googleMapsPlaceId?: string
  addressDirections?: string
  contentStatus: string
  lastVerifiedDate?: string
  articleBody?: unknown[]
  country?: { name: string; slug: string; countryCode?: string; overview?: string; whenToGo?: string }
  city?: { name: string; slug: string }
  nearbyCities?: { name: string; slug: string }[]
  featuredIn?: { title: string; slug: string }[]
  countryAttractions?: { name: string; slug: string; type?: string[]; editorialSummary?: string }[]
}

type PortableBlock = {
  _type: string
  _key?: string
  style?: string
  children?: Array<{ _key?: string; _type?: string; text: string; marks?: string[] }>
  [key: string]: unknown
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVerifiedDate(raw: string): string {
  const d = new Date(raw + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })
}

function filterSeparators(blocks: unknown[]): unknown[] {
  return (blocks as PortableBlock[]).filter(block => {
    if (block._type !== 'block') return true
    const text = (block.children ?? []).map(c => c.text).join('').trim()
    return text !== 'MyAfroWaka Separator' && !text.startsWith('MyAfroWaka Separator')
  })
}

function hasMeaningfulContent(content: unknown[]): boolean {
  return (content as PortableBlock[]).some(block => {
    if (block._type !== 'block') return true  // images, embeds, etc. always count
    const text = (block.children ?? []).map(c => c.text).join('').trim()
    return text.length > 0
  })
}

function groupByH2(blocks: unknown[]): { title: string; content: unknown[]; defaultOpen: boolean }[] {
  const groups: { title: string; content: unknown[]; defaultOpen: boolean }[] = []
  let current: { title: string; content: unknown[] } | null = null
  const preamble: unknown[] = []

  for (const block of blocks as PortableBlock[]) {
    if (block._type === 'block' && block.style === 'h2') {
      if (current) groups.push({ ...current, defaultOpen: false })
      const title = (block.children ?? []).map(c => c.text).join('')
      current = { title, content: [] }
    } else if (current) {
      current.content.push(block)
    } else {
      preamble.push(block)
    }
  }
  if (current) groups.push({ ...current, defaultOpen: false })

  if (preamble.length > 0) {
    groups.unshift({ title: 'Quick Overview', content: preamble, defaultOpen: true })
  } else if (groups.length > 0) {
    groups[0].defaultOpen = true
  }

  return groups
}

// ── Attraction image helpers ──────────────────────────────────────────────────

const attractionImageUrl = attractionStockImage

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_PUBLISHED_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const a = await client.fetch<Attraction | null>(ATTRACTION_BY_SLUG_QUERY, { slug })
  if (!a) return {}
  const title = a.metaTitle || `${a.name} Travel Guide – ${a.country?.name ?? 'Africa'} | MyAfroWaka`
  const description = a.metaDescription || a.editorialSummary || `Discover ${a.name} in ${a.country?.name ?? 'Africa'}. Verified travel guide with visitor information, entry fees, best time to visit, and how to get there.`
  const canonicalUrl = `https://myafrowaka.com/attractions/${slug}`
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: a.metaTitle || `${a.name} – ${a.country?.name ?? 'Africa'} Travel Guide`,
      description,
      type: 'article',
      url: canonicalUrl,
      images: [attractionImageUrl(slug)],
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle || `${a.name} – ${a.country?.name ?? 'Africa'} Travel Guide`,
      description,
      images: [attractionImageUrl(slug)],
    },
  }
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(a: Attraction) {
  const url = `https://myafrowaka.com/attractions/${a.slug.current}`
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myafrowaka.com' },
    ...(a.country ? [{ '@type': 'ListItem', position: 2, name: a.country.name, item: `https://myafrowaka.com/destinations/${a.country.slug}` }] : []),
    ...(a.city    ? [{ '@type': 'ListItem', position: 3, name: a.city.name,    item: `https://myafrowaka.com/cities/${a.city.slug}`    }] : []),
    {
      '@type': 'ListItem',
      position: (a.country ? 1 : 0) + (a.city ? 1 : 0) + 2,
      name: a.name,
      item: url,
    },
  ]

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: a.name,
      description: a.editorialSummary || '',
      url,
      ...(a.latitude && a.longitude ? {
        geo: { '@type': 'GeoCoordinates', latitude: a.latitude, longitude: a.longitude },
      } : {}),
      ...(a.addressDirections ? {
        address: { '@type': 'PostalAddress', streetAddress: a.addressDirections },
      } : {}),
      ...(a.country ? {
        containedInPlace: {
          '@type': 'Country',
          name: a.country.name,
          url: `https://myafrowaka.com/destinations/${a.country.slug}`,
        },
      } : {}),
      ...(a.unescoStatus && a.unescoStatus !== 'Not UNESCO Listed' ? {
        additionalProperty: { '@type': 'PropertyValue', name: 'UNESCO Status', value: a.unescoStatus },
      } : {}),
      ...(a.type && a.type.length > 0 ? {
        touristType: a.type.map(t => t.replace('UNESCO World Heritage Site | ', '')),
      } : {}),
      isAccessibleForFree: a.entryFeeInternational === 0,
      publisher: {
        '@type': 'Organization',
        name: 'MyAfroWaka',
        url: 'https://myafrowaka.com',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs,
    },
  ]

  return schemas
}

// ── Prose classes (shared, with dark mode) ─────────────────────────────────────

const PROSE = `prose prose-lg max-w-none
  prose-headings:font-display prose-headings:tracking-tight prose-headings:leading-tight
  prose-headings:text-charcoal dark:prose-headings:text-cream
  prose-h3:text-xl prose-h3:text-crimson dark:prose-h3:text-crimson
  prose-p:text-charcoal/75 dark:prose-p:text-cream/70 prose-p:leading-relaxed prose-p:font-sans
  prose-a:text-crimson prose-a:no-underline hover:prose-a:underline
  prose-strong:text-charcoal dark:prose-strong:text-cream prose-strong:font-semibold
  prose-ul:text-charcoal/75 dark:prose-ul:text-cream/70 prose-li:leading-relaxed
  prose-blockquote:border-l-0 prose-blockquote:bg-sand dark:prose-blockquote:bg-ink-surf
  prose-blockquote:rounded-2xl prose-blockquote:px-6 prose-blockquote:py-5
  prose-blockquote:italic prose-blockquote:text-charcoal/70 dark:prose-blockquote:text-cream/60`

// ── Smart FAQ answer generator ────────────────────────────────────────────────

function generateFaqAnswer(question: string, a: Attraction): string {
  const q = question.toLowerCase()
  const name = a.name
  const typeLabel = (a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || 'attraction').toLowerCase()
  const location = [a.city?.name, a.country?.name].filter(Boolean).join(', ') || a.continentRegion || 'Africa'

  if ((q.includes('best time') || q.includes('when to visit') || q.includes('when should')) && a.bestTimeToVisit) {
    return `The best time to visit ${name} is ${a.bestTimeToVisit}. Planning your trip around this window ensures the most favourable conditions and a more rewarding experience.`
  }
  if ((q.includes('how long') || q.includes('how much time') || q.includes('duration') || q.includes('hours')) && a.timeNeeded != null) {
    const hrs = a.timeNeeded === 1 ? 'one hour' : `${a.timeNeeded} hours`
    return `Plan to spend approximately ${hrs} at ${name}. Visitors with a deeper interest in ${typeLabel} history and context may wish to allow more time to fully absorb what the site offers.`
  }
  if (q.includes('entry fee') || q.includes('ticket') || (q.includes('how much') && q.includes('cost')) || q.includes('admission') || q.includes('price')) {
    if (a.entryFeeDisplayText) return a.entryFeeDisplayText.split('\n')[0]
    if (a.entryFeeInternational === 0) return `Entry to ${name} is free of charge for all visitors.`
    if (a.entryFeeInternational != null) {
      let ans = `Entry for international visitors to ${name} starts from $${a.entryFeeInternational} USD.`
      if (a.entryFeeLocal != null) ans += ` Local and resident visitors pay a reduced rate.`
      return ans
    }
    return `Entry fee information for ${name} is best confirmed directly with the site or local tourist authority before your visit, as prices can change seasonally.`
  }
  if ((q.includes('how to get') || q.includes('getting there') || q.includes('transport') || q.includes('directions') || q.includes('reach')) && a.gettingThere) {
    return a.gettingThere.split('\n')[0]
  }
  if ((q.includes('airport') || q.includes('fly') || q.includes('nearest airport') || q.includes('closest airport')) && a.nearestAirportIATA) {
    return `The nearest major airport to ${name} is ${a.nearestAirportIATA}${a.nearestAirportDistanceKm ? `, approximately ${a.nearestAirportDistanceKm} km from the site` : ''}. Onward travel is typically by road, and local transfer options vary by season.`
  }
  if ((q.includes('suitable') || q.includes('family') || q.includes('children') || q.includes('kids') || q.includes('who can') || q.includes('who is')) && a.suitableFor) {
    return `${name} is recommended for ${a.suitableFor.join(', ').toLowerCase()}. Access is rated ${a.difficultyAccessLevel?.toLowerCase() || 'moderate'}, so visitors should plan accordingly.`
  }
  if ((q.includes('unesco') || q.includes('world heritage') || q.includes('heritage status')) && a.unescoStatus) {
    return `${name} holds ${a.unescoStatus} status, recognised by UNESCO for its outstanding universal value. It is among Africa's most significant protected ${typeLabel} sites.`
  }
  if ((q.includes('overview') || q.includes('what is') || q.includes('about') || q.includes('describe')) && a.editorialSummary) {
    return a.editorialSummary
  }
  // Generic fallback using what we know
  return `${name} is a ${typeLabel} in ${location}. ${a.editorialSummary || `It is one of ${a.country?.name || a.continentRegion || "Africa"}'s most notable visitor sites.`} For the most current visitor information, contact info@myafrowaka.com.`
}

// ── Rich overview generator (used when no Sanity article body exists) ─────────

function generateOverview(a: Attraction): { p1: string; p2: string; p3?: string } {
  const typeLabel = (a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || 'attraction').toLowerCase()
  const location = [a.city?.name, a.country?.name].filter(Boolean).join(', ') || a.continentRegion || 'Africa'
  const region = a.continentRegion || a.country?.name || 'Africa'

  // ── Paragraph 1: Identity + significance + context ───────────────────────
  const s1: string[] = []

  if (a.editorialSummary) {
    s1.push(a.editorialSummary.replace(/\.$/, '') + '.')
  } else {
    s1.push(`${a.name} is a ${typeLabel} located in ${location}.`)
  }

  if (a.unescoStatus && a.unescoStatus !== 'Not UNESCO Listed') {
    s1.push(`Designated as a ${a.unescoStatus}, it is recognised by UNESCO among the world's outstanding cultural and natural sites.`)
  }

  if (a.heritageEra && a.heritageEra.length > 0) {
    const eras = a.heritageEra.join(' and ')
    s1.push(`The site traces its roots to ${eras} civilisation, making it one of the most historically significant landmarks in ${region}.`)
  } else if (a.primaryBrandPillar && !a.unescoStatus) {
    s1.push(`Positioned at the intersection of ${a.primaryBrandPillar.toLowerCase()} and authentic discovery, it draws visitors seeking genuine ${typeLabel} experiences in ${a.country?.name || region}.`)
  }

  if (a.experienceTags && a.experienceTags.length > 0 && s1.length < 3) {
    const tags = a.experienceTags.slice(0, 3).join(', ')
    s1.push(`Key experiences here include ${tags.toLowerCase()}.`)
  }

  const p1 = s1.join(' ')

  // ── Paragraph 2: Visitor practicalities ──────────────────────────────────
  const s2: string[] = []

  if (a.bestTimeToVisit) {
    s2.push(`The best time to visit ${a.name} is ${a.bestTimeToVisit}.`)
  }

  if (a.timeNeeded != null && a.timeNeeded > 0) {
    const hrs = a.timeNeeded === 1 ? 'one hour' : `${a.timeNeeded} hours`
    s2.push(`Budget approximately ${hrs} to experience the site properly.`)
  }

  if (a.difficultyAccessLevel) {
    const accessMap: Record<string, string> = {
      'Easy': 'Access is straightforward and suitable for all fitness levels, including families with young children.',
      'Moderate': 'Access requires a moderate level of fitness, manageable for most visitors in reasonable health.',
      'Challenging': 'Access is physically challenging. Good fitness and appropriate footwear are essential.',
      'Very Challenging': 'Access is demanding. Strong physical fitness, proper equipment, and guided assistance are strongly recommended.',
    }
    s2.push(accessMap[a.difficultyAccessLevel] || `Access is rated ${a.difficultyAccessLevel}.`)
  }

  if (a.nearestAirportIATA) {
    const dist = a.nearestAirportDistanceKm ? `, approximately ${a.nearestAirportDistanceKm} km from the site` : ''
    s2.push(`The nearest major airport is ${a.nearestAirportIATA}${dist}.`)
  }

  if (a.suitableFor && a.suitableFor.length > 0) {
    s2.push(`This site is particularly well suited to ${a.suitableFor.slice(0, 3).join(', ').toLowerCase()}.`)
  }

  const p2 = s2.length > 0
    ? s2.join(' ')
    : `Comprehensive visitor information for ${a.name}, including transport options, booking guidance, and on-site logistics, is maintained by the MyAfroWaka editorial team. Contact info@myafrowaka.com for time-sensitive queries.`

  // ── Paragraph 3: Entry fees (only rendered if data is available) ──────────
  let p3: string | undefined
  if (a.entryFeeDisplayText) {
    p3 = a.entryFeeDisplayText.split('\n').slice(0, 2).join(' ')
  } else if (a.entryFeeInternational === 0) {
    p3 = `Entry to ${a.name} is free of charge for all visitors.`
  } else if (a.entryFeeInternational != null) {
    let t = `International visitor entry starts from $${a.entryFeeInternational} USD`
    if (a.entryFeeLocal != null && a.entryFeeLocal < a.entryFeeInternational) {
      t += `. Local and resident visitors pay a reduced rate of $${a.entryFeeLocal} USD`
    }
    t += '. Prices are verified at time of publication and are subject to change.'
    p3 = t
  }

  return { p1, p2, p3 }
}

// ── Fallback country attractions (used when Sanity returns empty) ─────────────

const FALLBACK_COUNTRY_ATTRACTIONS = [
  { name: 'Serengeti National Park',           slug: 'serengeti-national-park',           type: ['National Park'],              editorialSummary: 'The annual wildebeest migration through the Serengeti is the largest mammal movement on earth.' },
  { name: 'Victoria Falls',                    slug: 'victoria-falls',                    type: ['Natural Wonder'],             editorialSummary: 'One of the largest curtains of falling water on earth, audible from two kilometres away.' },
  { name: 'Djemaa el-Fna',                    slug: 'djemaa-el-fna-marrakech',           type: ['Cultural Site'],              editorialSummary: 'A square that transforms from morning market to night festival.' },
  { name: 'Lalibela Rock-Hewn Churches',       slug: 'lalibela-rock-hewn-churches',       type: ['UNESCO World Heritage Site'], editorialSummary: 'Eleven monolithic churches carved directly from the rock in the twelfth century.' },
  { name: 'Ngorongoro Crater',                 slug: 'ngorongoro-conservation-area',      type: ['UNESCO World Heritage Site'], editorialSummary: "The world's largest intact volcanic caldera." },
  { name: 'Volcanoes National Park',           slug: 'volcanoes-national-park-rwanda',    type: ['National Park'],              editorialSummary: "Trekking to mountain gorilla families in the Virunga Mountains." },
  { name: 'Bwindi Impenetrable National Park', slug: 'bwindi-impenetrable-national-park', type: ['National Park'],              editorialSummary: "Home to roughly half the world's remaining mountain gorilla population." },
  { name: 'Cape Point',                        slug: 'cape-point-south-africa',           type: ['Nature Reserve'],             editorialSummary: 'Where the Atlantic and the cliffs of the Cape Peninsula meet at the southwestern tip.' },
  { name: 'Stone Town',                        slug: 'stone-town-zanzibar',               type: ['UNESCO World Heritage Site'], editorialSummary: 'Six centuries of Swahili, Arab, Indian, and British influence compressed into one navigable old town.' },
  { name: 'Maasai Mara National Reserve',      slug: 'maasai-mara-national-reserve',      type: ['National Reserve'],           editorialSummary: 'The Kenyan portion of the Serengeti ecosystem and site of the annual Mara River crossing.' },
  { name: 'Sossusvlei Dunes',                  slug: 'sossusvlei-namib-desert',           type: ['Natural Wonder'],             editorialSummary: 'The tallest dunes in the world change colour at dawn and dusk.' },
  { name: 'Pyramids of Giza',                  slug: 'pyramids-of-giza',                  type: ['UNESCO World Heritage Site'], editorialSummary: 'The last surviving Wonder of the Ancient World, standing on the Giza Plateau outside Cairo.' },
]

// ── Quick Overview static content (condensed 1–2 para summaries) ─────────────

const QUICK_OVERVIEWS: Record<string, string[]> = {
  'pyramids-of-giza': [
    'The Pyramids of Giza are the last surviving Wonder of the Ancient World, built on the Giza Plateau on the outskirts of Cairo, Egypt. The complex includes the Great Pyramid of Khufu, the Pyramid of Khafre, the Pyramid of Menkaure, and the Great Sphinx, constructed during the Old Kingdom period of ancient Egyptian civilisation beginning around 2560 BCE. The site holds UNESCO World Heritage status alongside the entire Memphis necropolis and is one of the most studied archaeological sites on earth.',
    'Visitors approach from the northern entrance, with guided tours of the interior burial chambers available by separate permit. The plateau is accessible year-round, with cooler temperatures between October and March making exploration more comfortable. Cairo International Airport (CAI) is the nearest major gateway, with the Giza Plateau located approximately 20 km southwest of central Cairo by road.',
  ],
  'serengeti-national-park': [
    'Serengeti National Park in northern Tanzania protects one of the oldest and most intact savannah ecosystems on earth, covering open grassland, river corridors, acacia woodland, and kopje rock formations. The park is most associated with the annual wildebeest migration, in which vast herds of wildebeest, zebra, and gazelle move in a continuous circuit between the Serengeti and Kenya\'s Maasai Mara, following rainfall patterns rather than a fixed calendar. The park holds UNESCO World Heritage status and is a core reference point in African conservation science.',
    'Game drives are the standard method of exploring the Serengeti, typically departing at dawn from permanent lodges or tented camps positioned across different ecosystem zones. The dry season from June to October concentrates wildlife around water sources and produces optimal viewing conditions, while the green season offers calving events and exceptional bird diversity. Kilimanjaro International (JRO) and Julius Nyerere International (DAR) are the primary arrival airports, with charter flights connecting to airstrips within the park.',
  ],
  'victoria-falls': [
    'Victoria Falls, known locally as Mosi-oa-Tunya, meaning The Smoke That Thunders, sits on the Zambezi River at the border between Zimbabwe and Zambia. The falls stretch over a kilometre across a basalt gorge and produce a mist cloud visible from a considerable distance, creating one of the most powerful natural spectacles on the African continent. UNESCO designates the site as a World Heritage Property, and it is accessible from both the Zimbabwean town of Victoria Falls and the Zambian town of Livingstone, each offering different vantage points along the gorge rim.',
    'Peak water flow occurs between February and May when the Zambezi is at its highest, though mist can obscure close-up views. The dry season from September to December offers clearer sightlines across the curtain of water and lower-risk access to some viewpoints. Adjacent to the falls, both sides of the border support accommodation, adventure activities including whitewater rafting and gorge walking, and access to major wildlife areas in Hwange National Park on the Zimbabwean side.',
  ],
  'bwindi-impenetrable-national-park': [
    'Bwindi Impenetrable National Park in southwestern Uganda is home to roughly half the remaining global population of mountain gorillas, making it one of the most critical conservation sites on the African continent. The park covers over 300 square kilometres of ancient montane rainforest, one of Africa\'s oldest and most biodiverse ecosystems, and holds UNESCO World Heritage status as part of the Bwindi-Sarambwe transboundary conservation landscape. Gorilla trekking permits are required and must be booked in advance through the Uganda Wildlife Authority.',
    'The park is divided into four sectors, Buhoma, Ruhija, Rushaga, and Nkuringo, each with separately allocated gorilla families for trekking. Trek durations vary considerably depending on where the gorilla group has moved on the day, ranging from under two hours to a full day of walking through dense terrain. Entebbe International Airport (EBB) is the nearest international gateway, with the park located approximately 480 km from Kampala by road; domestic charter flights to Kihihi or Kisoro airstrips reduce the overland transfer significantly.',
  ],
  'djemaa-el-fna-marrakech': [
    'Djemaa el-Fna is the main public square at the heart of the medina of Marrakech, Morocco, and one of the most continuously active social spaces in North Africa. During daylight hours the square functions as an open market for food vendors, henna artists, musicians, and acrobats. After sunset it transforms into a dense open-air gathering of food stalls, storytellers, and performers that draws both residents and visitors in equal measure. UNESCO recognises Djemaa el-Fna as a Masterpiece of the Oral and Intangible Heritage of Humanity, placing its cultural significance in the living traditions rather than any single structure.',
    'The square is positioned at the entrance to the medina\'s souk network, which extends northward through narrow lanes toward the Ben Youssef Mosque. Most riads and guesthouses within the medina are within walking distance. Marrakech Menara Airport (RAK) is approximately 6 km from the medina centre. Entry to the square itself is free, with visitor costs arising from food, optional services, and accommodation in the surrounding neighbourhood.',
  ],
  'sossusvlei-namib-desert': [
    'Sossusvlei is a salt and clay pan in the southern Namib Desert, located within Namibia\'s Namib-Naukluft National Park. The surrounding star dunes are among the tallest in the world and are composed of wind-redistributed quartz sand coated in iron oxide, which gives them a deep red and orange coloration that intensifies at dawn and late afternoon. Deadvlei, a white clay pan immediately adjacent, contains ancient dead camel thorn trees that have remained standing for centuries in the desiccated environment without decomposing. The contrast between the pale pan floor and the surrounding dune faces is one of the most photographed natural scenes on the continent.',
    'Access to Sossusvlei requires entry through the Sesriem gate, the only entry point, from which a road leads through the park toward the final parking area. A four-wheel drive vehicle or the park\'s shuttle service is required for the final stretch to reach Deadvlei and Sossusvlei. The nearest settlement is Sesriem, with accommodation ranging from a basic campsite to high-end desert lodges along the rim. Hosea Kutako International Airport (WDH) in Windhoek is the nearest major international arrival point.',
  ],
  'volcanoes-national-park-rwanda': [
    'Volcanoes National Park in northwest Rwanda protects the Rwandan sector of the Virunga Mountains, a chain of volcanic peaks shared with Uganda and the Democratic Republic of Congo. The park is one of a small number of places on earth where visitors can obtain permits to trek in the presence of habituated mountain gorilla groups. Permits are issued through the Rwanda Development Board and must be booked well in advance; each permitted group allows a limited number of visitors per day and restricts contact time to one hour. The park also contains golden monkey habitats, accessible via separate permits, and several volcanic summits including Karisimbi and Bisoke.',
    'Trek durations depend on the gorilla group\'s location on the day of the visit and can involve several hours of walking through dense bamboo forest and volcanic terrain. The nearest city is Musanze, also known as Ruhengeri, approximately 110 km northwest of Kigali International Airport (KGL) by road. Staying in Musanze the night before allows an early start for the morning briefing. Day trips from Kigali are possible but involve a long return transfer after the trek.',
  ],
  'cape-point-south-africa': [
    'Cape Point is the southeastern headland of the Cape Peninsula in the Western Cape of South Africa, falling within the Table Mountain National Park. The site sits at the meeting of Atlantic and Indian Ocean currents, a geographic boundary that shapes the remarkable plant and animal life of the peninsula. The Cape Floral Region, of which the Cape Peninsula forms a significant part, holds UNESCO World Heritage status for the extraordinary concentration and variety of plant species found across its fynbos biome. Visitors typically combine Cape Point with the Cape of Good Hope, located a short distance to the southwest along the peninsula.',
    'The site is accessible by road from Cape Town, approximately 70 km from the city centre via Chapman\'s Peak or the M65. A funicular connects the lower visitor area to the historic lighthouse at the headland\'s peak, with walking as an alternative. Wildlife on the peninsula includes Cape baboons, bontebok, and ostriches that roam freely throughout the reserve. Cape Town International Airport (CPT) is the nearest major airport.',
  ],
  'lalibela-rock-hewn-churches': [
    'The rock-hewn churches of Lalibela in the Amhara region of northern Ethiopia are eleven monolithic places of Christian worship carved directly from the surrounding bedrock, believed to have been commissioned primarily during the reign of King Lalibela in the twelfth and thirteenth centuries. The king reportedly intended the site to function as a New Jerusalem for Ethiopian Orthodox pilgrims who could not reach the original city. UNESCO designates the complex as a World Heritage Site and regards it as one of the outstanding architectural achievements of African civilisation.',
    'The churches are divided into two main clusters connected by tunnels and ceremonial trenches, with the famous free-standing Bete Giyorgis church standing apart to the southwest. All eleven churches remain active places of worship, hosting major religious ceremonies including Ethiopian Christmas in January and Epiphany in January. Lalibela Airport (LLI) receives regular flights from Addis Ababa Bole International Airport. A thorough visit to both church clusters typically requires one to two full days.',
  ],
  'maasai-mara-national-reserve': [
    'Maasai Mara National Reserve in southwestern Kenya forms the northern section of the Serengeti-Mara ecosystem, administered by the Narok County Council in partnership with the surrounding Maasai communities. The reserve holds one of Africa\'s highest permanent concentrations of large predators alongside a substantial resident population of elephant, buffalo, giraffe, and hippo. It is most associated internationally with the annual wildebeest river crossing at the Mara River, when large herds move from Tanzania\'s Serengeti into the Mara\'s northern grasslands. Crossing activity is most concentrated between July and October, though the timing and location of crossings cannot be guaranteed.',
    'Game drives operate from tented camps and lodges across the reserve and the adjacent private conservancies, including Olare Motorogi, Naboisho, and Mara North, which permit off-road driving and walking safaris not available inside the national reserve itself. Charter flights from Wilson Airport in Nairobi (WIL) connect to airstrips throughout the Mara. The reserve is a viable year-round destination, with the green season between November and June offering different but equally compelling wildlife encounters.',
  ],
  'stone-town-zanzibar': [
    'Stone Town is the historic urban core of Zanzibar City, located on the western coast of Unguja island in the Tanzanian archipelago. The town developed from the ninth century onward as a Swahili coastal trading settlement and was subsequently shaped by centuries of Persian, Arab, Indian, and British influence, producing a dense built fabric of coral stone buildings, carved wooden doors, and narrow pedestrian lanes that UNESCO designated as a World Heritage Site in 2000. Stone Town served as the seat of the Omani Sultanate\'s East African empire, a hub of the Indian Ocean trade network, and the birthplace of the musician Freddie Mercury. It remains a living and inhabited city today.',
    'Key points of interest include Forodhani Gardens along the seafront, the House of Wonders, the Arab Fort, and the Anglican Cathedral built on the site of the former slave market. Day excursions to spice farms in the island\'s interior are widely available from Stone Town. Abeid Amani Karume International Airport (ZNZ) is the main arrival point, receiving flights from mainland Tanzania and select regional routes. Stone Town serves as the standard base for visitors to Zanzibar who also intend to reach the island\'s northern beaches.',
  ],
  'ngorongoro-conservation-area': [
    'The Ngorongoro Conservation Area in northern Tanzania encompasses the world\'s largest intact volcanic caldera, a circular depression formed when a massive volcanic cone collapsed inward an estimated two to three million years ago. The caldera floor supports a large permanent population of plains wildlife, including a dense concentration of predators among the highest recorded in any ecosystem on earth. The site holds both UNESCO World Heritage Site and Biosphere Reserve status and forms part of the Northern Tanzania safari circuit alongside the Serengeti, Tarangire, and Lake Manyara National Parks. Unlike most protected areas in Tanzania, the Conservation Area permits Maasai pastoralists to continue using portions of the landscape alongside wildlife.',
    'Game drives descend from the crater rim into the enclosed floor, where the contained terrain allows extended and close encounters with wildlife. All vehicles entering the caldera require four-wheel drive capability. Accommodation is concentrated along the eastern and western rim, with lodges oriented toward the caldera view. Kilimanjaro International Airport (JRO) is the primary gateway, with the crater approximately 180 km by road from Arusha. Day trips from Arusha are possible; staying overnight at the rim allows earlier access before tour vehicle traffic peaks on the descent road.',
  ],
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AttractionPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const a = await client.fetch<Attraction | null>(ATTRACTION_BY_SLUG_QUERY, { slug })
  if (!a) notFound()

  const jsonLd = buildJsonLd(a)
  const locationParts = [a.city?.name, a.subRegionProvince, a.country?.name].filter(Boolean)

  const secondaryKws = a.secondaryKeywords
    ? a.secondaryKeywords.split('|').map(s => s.trim()).filter(Boolean)
    : []

  const faqItems = secondaryKws.slice(0, 6).map(kw => {
    const question = kw.charAt(0).toUpperCase() + kw.slice(1) + '?'
    return { question, answer: generateFaqAnswer(question, a) }
  })

  const hasContent = Array.isArray(a.articleBody) && a.articleBody.length > 0

  // Use Sanity countryAttractions if available, else show fallback suggestions
  const displayRelated = (a.countryAttractions && a.countryAttractions.length > 0)
    ? a.countryAttractions
    : FALLBACK_COUNTRY_ATTRACTIONS.filter(fa => fa.slug !== slug).slice(0, 3)
  const filteredBody = hasContent ? filterSeparators(a.articleBody!) : []
  const sections = hasContent ? groupByH2(filteredBody) : []

  // True when the first section is a 'Quick Overview' that actually has readable text.
  // If it's empty (blank preamble or empty QO h2), we inject generated content instead.
  const firstIsQO      = sections[0]?.title === 'Quick Overview'
  const firstHasText   = firstIsQO && hasMeaningfulContent(sections[0].content)
  const needsInjection = hasContent && !firstHasText
  const generatedOv    = needsInjection && !QUICK_OVERVIEWS[slug] ? generateOverview(a) : null

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[480px] flex items-end">
        <div className="absolute inset-0">
        <Image
          src={attractionImageUrl(slug)}
          alt={a.name}
          fill priority
          className="object-cover object-center scale-110"
        />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/65 to-ink/97"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">

          {/* Badges */}
          {(a.unescoStatus || (a.type && a.type.length > 0)) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {a.unescoStatus && <Badge variant="unesco">UNESCO</Badge>}
              {a.type?.slice(0, 3).map(t => (
                <Badge key={t} variant="tag">{t.replace('UNESCO World Heritage Site | ', '')}</Badge>
              ))}
            </div>
          )}

          {/* H1 */}
          <h1
            className="font-display font-extrabold text-cream mb-4 max-w-3xl"
            style={{ fontSize: 'clamp(28px, 5vw, 64px)', lineHeight: '0.95', letterSpacing: '-0.025em' }}
          >
            {a.name}
          </h1>

          {/* Location */}
          {locationParts.length > 0 && (
            <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400 mb-4">
              {locationParts.join(' · ')}
            </p>
          )}

          {/* Summary */}
          {a.editorialSummary && (
            <p className="font-sans italic text-cream/70 leading-relaxed max-w-2xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 17px)' }}>
              {a.editorialSummary}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">

            {/* ── Main content (2/3) ──────────────────────────────────── */}
            <div className="lg:col-span-2 min-w-0">

              {/* Mobile-only At a Glance */}
              <div className="lg:hidden bg-ink rounded-3xl p-6 text-cream mb-8">
                <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400 mb-5">At a Glance</p>
                <div className="space-y-0">
                  {a.country && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Country</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right flex items-center gap-1.5 justify-end">
                        <Flag code={a.country.countryCode} />
                        {a.country.name}
                      </span>
                    </div>
                  )}
                  {a.continentRegion && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Region</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.continentRegion}</span>
                    </div>
                  )}
                  {a.type && a.type.length > 0 && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Type</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right leading-snug">{a.type[0].replace('UNESCO World Heritage Site | ', '')}</span>
                    </div>
                  )}
                  {a.city && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Nearest City</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.city.name}</span>
                    </div>
                  )}
                  {a.nearestAirportIATA && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Airport</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">
                        {a.nearestAirportIATA}{a.nearestAirportDistanceKm ? ` (${a.nearestAirportDistanceKm} km)` : ''}
                      </span>
                    </div>
                  )}
                  {a.heritageEra && a.heritageEra.length > 0 && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Era</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right leading-snug">{a.heritageEra.join(', ')}</span>
                    </div>
                  )}
                  {a.suitableFor && a.suitableFor.length > 0 && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Suitable For</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right leading-snug">{a.suitableFor.slice(0, 3).join(', ')}</span>
                    </div>
                  )}
                  {(a.entryFeeDisplayText || a.entryFeeInternational != null) && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Entry</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">
                        {a.entryFeeDisplayText
                          ? a.entryFeeDisplayText.split('\n')[0]
                          : a.entryFeeInternational === 0 ? 'Free' : `From $${a.entryFeeInternational} USD`}
                      </span>
                    </div>
                  )}
                  {a.bestTimeToVisit && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Best Time</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.bestTimeToVisit}</span>
                    </div>
                  )}
                  {a.timeNeeded != null && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Time Needed</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.timeNeeded} hr{a.timeNeeded !== 1 ? 's' : ''} min</span>
                    </div>
                  )}
                  {a.difficultyAccessLevel && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Access</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.difficultyAccessLevel}</span>
                    </div>
                  )}
                  {a.unescoStatus && (
                    <div className="flex items-start justify-between gap-3 pt-3">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">UNESCO</span>
                      <span className="font-sans text-[14px] text-gold-300 text-right leading-snug">{a.unescoStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {hasContent ? (
                <div className="divide-y divide-line dark-flip-border border-t border-line dark-flip-border">
                  {/* Inject generated Quick Overview when article has none (or an empty one) */}
                  {needsInjection && (
                    <CollapsibleSection title="Quick Overview" defaultOpen={true}>
                      {QUICK_OVERVIEWS[slug] ? (
                        <div className="space-y-4">
                          {QUICK_OVERVIEWS[slug].map((p, pi) => (
                            <p key={pi} className={`font-sans text-[15px] leading-[1.8] ${pi === 0 ? 'text-charcoal/75 dark-flip-muted' : 'text-charcoal/60 dark-flip-muted'}`}>{p}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-[1.8]">{generatedOv!.p1}</p>
                          <p className="font-sans text-[15px] text-charcoal/60 dark-flip-muted leading-[1.8]">{generatedOv!.p2}</p>
                          {generatedOv!.p3 && <p className="font-sans text-[15px] text-charcoal/60 dark-flip-muted leading-[1.8]">{generatedOv!.p3}</p>}
                        </div>
                      )}
                    </CollapsibleSection>
                  )}
                  {sections.map((section, i) => {
                    if (needsInjection && section.title === 'Quick Overview') return null
                    return (
                      <CollapsibleSection
                        key={i}
                        title={section.title}
                        defaultOpen={section.defaultOpen}
                      >
                        <div className={PROSE}>
                          <PortableText
                            value={section.content as Parameters<typeof PortableText>[0]['value']}
                          />
                        </div>
                      </CollapsibleSection>
                    )
                  })}
                </div>
              ) : (
                /* ── Fallback: structured data sections ────────────────── */
                <div className="divide-y divide-line dark-flip-border border-t border-line dark-flip-border">

                  {/* Quick Overview — always open */}
                  <CollapsibleSection title="Quick Overview" defaultOpen={true}>
                    {QUICK_OVERVIEWS[slug] ? (
                      <div className="space-y-4">
                        {QUICK_OVERVIEWS[slug].map((p, pi) => (
                          <p key={pi} className={`font-sans text-[15px] leading-[1.8] ${pi === 0 ? 'text-charcoal/75 dark-flip-muted' : 'text-charcoal/60 dark-flip-muted'}`}>{p}</p>
                        ))}
                      </div>
                    ) : (() => {
                      const { p1, p2, p3 } = generateOverview(a)
                      return (
                        <div className="space-y-4">
                          <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-[1.8]">{p1}</p>
                          <p className="font-sans text-[15px] text-charcoal/60 dark-flip-muted leading-[1.8]">{p2}</p>
                          {p3 && <p className="font-sans text-[15px] text-charcoal/60 dark-flip-muted leading-[1.8]">{p3}</p>}
                        </div>
                      )
                    })()}
                  </CollapsibleSection>

                  {/* How to Get There */}
                  {a.gettingThere && (
                    <CollapsibleSection title="How to Get There">
                      <p className="font-sans text-[15px] text-charcoal/70 dark-flip-muted leading-relaxed whitespace-pre-line mb-4">
                        {a.gettingThere}
                      </p>
                      {a.addressDirections && (
                        <div className="bg-sand dark-flip-surf rounded-2xl p-5 border border-line dark-flip-border">
                          <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/55 dark-flip-muted mb-2">Address</p>
                          <p className="font-sans text-[14px] text-charcoal/75 dark-flip-muted">{a.addressDirections}</p>
                        </div>
                      )}
                    </CollapsibleSection>
                  )}

                  {/* Entry Fees */}
                  {(a.entryFeeDisplayText || a.entryFeeInternational != null) && (
                    <CollapsibleSection title="Entry Fees">
                      {a.entryFeeDisplayText ? (
                        <p className="font-sans text-[15px] text-charcoal/70 dark-flip-muted leading-relaxed whitespace-pre-line">
                          {a.entryFeeDisplayText}
                        </p>
                      ) : (
                        <div className="flex gap-8">
                          {a.entryFeeInternational != null && (
                            <div>
                              <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted mb-1">International</p>
                              <p className="font-display font-bold text-4xl text-charcoal dark-flip-text" style={{ letterSpacing: '-0.02em' }}>
                                {a.entryFeeInternational === 0 ? 'Free' : `$${a.entryFeeInternational}`}
                              </p>
                            </div>
                          )}
                          {a.entryFeeLocal != null && (
                            <div>
                              <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted mb-1">Local / Resident</p>
                              <p className="font-display font-bold text-4xl text-charcoal dark-flip-text" style={{ letterSpacing: '-0.02em' }}>
                                {a.entryFeeLocal === 0 ? 'Free' : `$${a.entryFeeLocal}`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CollapsibleSection>
                  )}

                  {/* Best Time to Visit */}
                  {a.bestTimeToVisit && (
                    <CollapsibleSection title="Best Time to Visit">
                      <p className="font-sans text-[15px] text-charcoal/70 dark-flip-muted leading-relaxed whitespace-pre-line">
                        {a.bestTimeToVisit}
                      </p>
                    </CollapsibleSection>
                  )}

                  {/* Nearby Cities */}
                  {a.nearbyCities && a.nearbyCities.length > 0 && (
                    <CollapsibleSection title="Nearby Cities">
                      <div className="flex flex-wrap gap-2">
                        {a.nearbyCities.map(city => (
                          <Link
                            key={city.slug}
                            href={`/cities/${city.slug}`}
                            className="bg-sand dark-flip-surf hover:bg-gold-50 text-charcoal/70 dark-flip-muted text-[14px] font-sans px-4 py-2 rounded-full border border-line dark-flip-border hover:border-gold-300 transition-colors"
                          >
                            {city.name}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                </div>
              )}

              {/* Experience tags */}
              {a.experienceTags && a.experienceTags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-line dark-flip-border">
                  <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/55 dark-flip-muted mb-4">Tagged</p>
                  <div className="flex flex-wrap gap-2">
                    {a.experienceTags.map(tag => (
                      <span
                        key={tag}
                        className="bg-sand dark-flip-surf text-charcoal/60 dark-flip-muted text-[14px] font-sans px-3 py-1.5 rounded-full border border-line dark-flip-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {a.lastVerifiedDate && (
                <p className="mt-8 font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/50 dark-flip-muted">
                  Last updated: {formatVerifiedDate(a.lastVerifiedDate)}
                </p>
              )}
            </div>

            {/* ── Sidebar (1/3) ────────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* At a Glance - desktop only (mobile version appears above article body) */}
              <div className="hidden lg:block bg-ink rounded-3xl p-6 text-cream">
                <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400 mb-5">At a Glance</p>
                <div className="space-y-0">
                  {a.country && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Country</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right flex items-center gap-1.5 justify-end">
                        <Flag code={a.country.countryCode} />
                        {a.country.name}
                      </span>
                    </div>
                  )}
                  {a.continentRegion && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Region</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.continentRegion}</span>
                    </div>
                  )}
                  {a.type && a.type.length > 0 && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Type</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right leading-snug">{a.type[0].replace('UNESCO World Heritage Site | ', '')}</span>
                    </div>
                  )}
                  {a.city && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Nearest City</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.city.name}</span>
                    </div>
                  )}
                  {a.nearestAirportIATA && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Airport</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">
                        {a.nearestAirportIATA}{a.nearestAirportDistanceKm ? ` (${a.nearestAirportDistanceKm} km)` : ''}
                      </span>
                    </div>
                  )}
                  {a.heritageEra && a.heritageEra.length > 0 && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Era</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right leading-snug">{a.heritageEra.join(', ')}</span>
                    </div>
                  )}
                  {a.suitableFor && a.suitableFor.length > 0 && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Suitable For</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right leading-snug">{a.suitableFor.slice(0, 3).join(', ')}</span>
                    </div>
                  )}
                  {(a.entryFeeDisplayText || a.entryFeeInternational != null) && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Entry</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">
                        {a.entryFeeDisplayText
                          ? a.entryFeeDisplayText.split('\n')[0]
                          : a.entryFeeInternational === 0
                            ? 'Free'
                            : `From $${a.entryFeeInternational} USD`}
                      </span>
                    </div>
                  )}
                  {a.bestTimeToVisit && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Best Time</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.bestTimeToVisit}</span>
                    </div>
                  )}
                  {a.timeNeeded != null && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Time Needed</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">
                        {a.timeNeeded} hr{a.timeNeeded !== 1 ? 's' : ''} min
                      </span>
                    </div>
                  )}
                  {a.difficultyAccessLevel && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">Access</span>
                      <span className="font-sans text-[14px] text-cream/88 text-right">{a.difficultyAccessLevel}</span>
                    </div>
                  )}
                  {a.unescoStatus && (
                    <div className="flex items-start justify-between gap-3 pt-3">
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/60 mt-0.5 shrink-0">UNESCO</span>
                      <span className="font-sans text-[14px] text-gold-300 text-right leading-snug">{a.unescoStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About the country — short summary, links through to the full overview */}
              {a.country?.overview && (
                <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/55 dark-flip-muted mb-4 flex items-center gap-2">
                    <Flag code={a.country.countryCode} />
                    About {a.country.name}
                  </p>
                  <p className="font-sans text-[14px] text-charcoal/70 dark-flip-muted leading-relaxed mb-2">
                    {a.country.overview}
                  </p>
                  {a.country.whenToGo && (
                    <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted leading-relaxed mb-4">
                      <span className="font-semibold text-charcoal/70 dark-flip-text">Best time to go: </span>
                      {a.country.whenToGo}
                    </p>
                  )}
                  <Link href={`/destinations/${a.country.slug}`}
                    className="inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
                    Full {a.country.name} guide
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </Link>
                </div>
              )}

              {/* Getting There */}
              {(a.nearestAirportIATA || a.addressDirections || a.googleMapsPlaceId) && (
                <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/55 dark-flip-muted mb-5">Getting There</p>
                  <div className="space-y-4">
                    {a.nearestAirportIATA && (
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-charcoal/40 dark-flip-muted mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                        <div>
                          <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text">
                            {a.nearestAirportIATA}
                          </p>
                          {a.nearestAirportDistanceKm && (
                            <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted mt-0.5">
                              {a.nearestAirportDistanceKm} km away
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {a.addressDirections && (
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-charcoal/40 dark-flip-muted mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed">
                          {a.addressDirections}
                        </p>
                      </div>
                    )}
                    {a.googleMapsPlaceId && (
                      <a
                        href={`https://www.google.com/maps/place/?q=place_id:${a.googleMapsPlaceId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors mt-1"
                      >
                        View on Google Maps
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Save to Trip */}
              <div className="border border-line dark-flip-border rounded-3xl p-6">
                <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/55 dark-flip-muted mb-3">Plan Your Visit</p>
                <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text mb-5" style={{ letterSpacing: '-0.012em' }}>
                  Save this attraction to your trip planner.
                </p>
                <SaveButton slug={slug} />
              </div>

              {/* Suitable For */}
              {a.suitableFor && a.suitableFor.length > 0 && (
                <div className="border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/55 dark-flip-muted mb-4">Suitable For</p>
                  <div className="flex flex-wrap gap-2">
                    {a.suitableFor.map(s => (
                      <span key={s} className="bg-sand dark-flip-surf text-charcoal/65 dark-flip-muted font-sans text-[14px] px-3.5 py-1.5 rounded-full border border-line dark-flip-border">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured In */}
              {a.featuredIn && a.featuredIn.length > 0 && (
                <div className="border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/55 dark-flip-muted mb-4">Featured In</p>
                  <div className="space-y-2">
                    {a.featuredIn.map(g => (
                      <Link key={g.slug} href={`/guides/${g.slug}`}
                        className="flex items-start gap-2.5 group py-1">
                        <svg className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                        <span className="font-sans text-[14px] text-charcoal/65 dark-flip-muted group-hover:text-crimson transition-colors leading-snug">
                          {g.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Country link */}
              {a.country && (
                <Link
                  href={`/destinations/${a.country.slug}`}
                  className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all"
                >
                  <div>
                    <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/55 dark-flip-muted mb-1">Explore more</p>
                    <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                      All attractions in {a.country.name}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-charcoal/25 group-hover:text-crimson transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </Link>
              )}

              {/* Report correction */}
              <a
                href={`mailto:info@myafrowaka.com?subject=Attraction Correction: ${encodeURIComponent(a.name)}`}
                className="flex items-center gap-2 justify-center font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted hover:text-charcoal/70 transition-colors py-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Report a correction
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ — separate full-width container ──────────────────────── */}
      {faqItems.length > 0 && (
        <div className="bg-sand dark-flip-surf border-t border-line dark-flip-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20">
            <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-charcoal/55 dark-flip-muted mb-3">
              Common Questions
            </p>
            <h2
              className="font-display font-bold text-charcoal dark-flip-text mb-8"
              style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', letterSpacing: '-0.018em' }}
            >
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      )}

      {/* Explore More in Country */}
      {a.country && displayRelated.length > 0 && (
        <div className="bg-cream dark-flip-bg border-t border-line dark-flip-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-2">Keep Exploring</p>
                <h2 className="font-display font-bold text-charcoal dark-flip-text"
                  style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', letterSpacing: '-0.018em' }}>
                  More to See in {a.country.name}
                </h2>
              </div>
              <Link href={`/destinations/${a.country.slug}`}
                className="inline-link link-arrow hidden sm:inline-flex font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted hover:text-crimson transition-colors shrink-0">
                All {a.country.name} guides
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayRelated.map(rel => {
                const typeLabel = (rel.type?.[0] ?? '').replace('UNESCO World Heritage Site | ', '')
                return (
                  <Link key={rel.slug} href={`/attractions/${rel.slug}`}
                    className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-40 overflow-hidden bg-sand">
                      <Image
                        src={attractionImageUrl(rel.slug)}
                        alt={rel.name} fill
                        sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw"
                        className="object-cover img-editorial img-inner"
                      />
                      {typeLabel && (
                        <span className="absolute top-2 left-2 bg-ink/75 backdrop-blur font-sans text-[14px] uppercase tracking-[0.13em] text-cream/85 px-2.5 py-0.5 rounded-full">
                          {typeLabel}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug text-[14px]"
                        style={{ letterSpacing: '-0.012em' }}>{rel.name}</h3>
                      {rel.editorialSummary && (
                        <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2 mt-1.5">
                          {rel.editorialSummary}
                        </p>
                      )}
                      <p className="mt-3 font-sans text-[14px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors">
                        Read guide &#8594;
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
