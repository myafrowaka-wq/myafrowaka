// Session 2.2 — country overview content seed.
// Run once with: node scripts/seed-country-overviews.js
// Sets countryCode (ISO 3166-1 alpha-2) on all 47 countries, and the full
// overview block (whenToGo, knownFor, surprises, gettingAround, visaInfo,
// safetyInfo, startHereAttractions) on the first batch of 8, chosen by
// current published-attraction count (highest first) with one tiebreak for
// regional spread (Ghana, to bring in West Africa — the top 7 by count were
// all East/North/Southern).

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('next-sanity')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// ISO 3166-1 alpha-2 codes for all 47 countries in the database.
const COUNTRY_CODES = {
  'country-algeria': 'dz',
  'country-angola': 'ao',
  'country-benin': 'bj',
  'country-botswana': 'bw',
  'country-burkina-faso': 'bf',
  'country-cameroon': 'cm',
  'country-cape-verde': 'cv',
  'country-comoros': 'km',
  'country-drc': 'cd',
  'country-egypt': 'eg',
  'country-equatorial-guinea': 'gq',
  'country-eritrea': 'er',
  'country-eswatini': 'sz',
  'country-ethiopia': 'et',
  'country-gabon': 'ga',
  'country-gambia': 'gm',
  'country-ghana': 'gh',
  'country-ivory-coast': 'ci',
  'country-kenya': 'ke',
  'country-lesotho': 'ls',
  'country-liberia': 'lr',
  'country-libya': 'ly',
  'country-madagascar': 'mg',
  'country-malawi': 'mw',
  'country-mali': 'ml',
  'country-mauritius': 'mu',
  'country-morocco': 'ma',
  'country-mozambique': 'mz',
  'country-namibia': 'na',
  'country-niger': 'ne',
  'country-nigeria': 'ng',
  'country-republic-of-congo': 'cg',
  'country-reunion': 're',
  'country-rwanda': 'rw',
  'country-senegal': 'sn',
  'country-seychelles': 'sc',
  'country-sierra-leone': 'sl',
  'country-somalia': 'so',
  'country-south-africa': 'za',
  'country-south-sudan': 'ss',
  'country-sudan': 'sd',
  'country-tanzania': 'tz',
  'country-togo': 'tg',
  'country-tunisia': 'tn',
  'country-uganda': 'ug',
  'country-zambia': 'zm',
  'country-zimbabwe': 'zw',
}

// Full overview content, batch 1 of 6 (8 countries). Every visaInfo/safetyInfo
// claim carries [VERIFY] + a primary source (travel.state.gov / U.S. Embassy)
// + the month checked, per Brain v2.0 Layer 1.3 — these change, and a stale
// claim presented as current is worse than admitting it needs a recheck.
const OVERVIEWS = {
  'country-tanzania': {
    overview: 'Tanzania pairs the classic safari circuit around the Serengeti and Ngorongoro Crater with Zanzibar’s Swahili coast, and Kilimanjaro rising alone above the plains between them.',
    whenToGo: 'June to October is the dry season and the best window for wildlife viewing across the northern parks, with the wildebeest migration typically crossing the Mara River between July and September. December to February is warmer and drier still, and the better choice for climbing Kilimanjaro or for Zanzibar’s beaches, though it overlaps with calving season in the southern Serengeti. March to May is the long rains, when many camps close and prices drop.',
    knownFor: 'The Serengeti-Ngorongoro ecosystem and the annual wildebeest migration, Mount Kilimanjaro as Africa’s highest peak and a non-technical, walkable summit, and Zanzibar’s Stone Town, a UNESCO World Heritage old town built on six centuries of Swahili, Arab, Indian and British trade.',
    surprises: 'Zanzibar is closer to a full Swahili-coast trip than a beach add-on. Stone Town alone is worth two full days. Kilimanjaro does not require technical climbing gear or prior mountaineering experience, only a multi-day trek and time to acclimatise, and altitude sickness shapes the schedule more than most first-time climbers expect. Mainland Tanzania and Zanzibar run on different local administrations even though both fall under one national visa.',
    gettingAround: 'Most visitors fly into Kilimanjaro International Airport (JRO) for the northern safari circuit or Zanzibar’s Abeid Amani Karume International Airport (ZNZ) for the coast, and connect between the two by a short domestic flight rather than by road. Transport inside the parks is by 4x4 with a driver-guide, arranged through the lodge or operator, not self-drive.',
    visaInfo: '[VERIFY, source: U.S. Embassy Tanzania, checked August 2026] Tourists need a visa. Most nationalities can apply for a one-year multiple-entry e-visa online in advance for $100, or on arrival, though applying ahead avoids queues. Source: tz.usembassy.gov (travel advisory update, October 2025).',
    safetyInfo: '[VERIFY, source: U.S. Department of State, checked August 2026] The advisory for Tanzania stands at Level 3, Reconsider Travel, citing crime, terrorism risk concentrated mainly in the Mtwara Region, civil unrest, and the targeting of LGBTQ+ travellers. This is a country-wide level, not specific to the main safari and Zanzibar circuit; check the current advisory before finalising travel, since levels change. Source: tz.usembassy.gov.',
    startHere: ['serengeti-national-park-tanzania', 'ngorongoro-crater-tanzania', 'mount-kilimanjaro-tanzania'],
  },
  'country-kenya': {
    overview: 'Kenya is the country most people picture when they imagine an African safari: the Maasai Mara, the Great Migration, and a stretch of Indian Ocean coast at Diani and Watamu that rarely gets equal attention.',
    whenToGo: 'July to October is the dry season and typically when the wildebeed migration is in the Maasai Mara itself, having crossed over from Tanzania’s Serengeti. January and February are also dry and good for wildlife viewing, with fewer crowds and lower prices than migration season. The coast is warm and swimmable year-round, driest from January to March and June to September.',
    knownFor: 'The Maasai Mara and the Great Migration, Nairobi as one of the few capital cities in the world with a national park inside it, and a long Swahili coastline at Diani, Watamu and Lamu that is culturally distinct from the interior.',
    surprises: 'Nairobi National Park sits a twenty-minute drive from the city centre, with giraffe and rhino visible against a skyline of office towers. The coast and the safari circuit feel like two different countries; most itineraries covering both need a domestic flight, not a drive. Lodge and camp prices for the same wildlife access vary enormously, and whether a property sits inside or outside the reserve boundary matters more than most first-time visitors assume.',
    gettingAround: 'Jomo Kenyatta International Airport (NBO) in Nairobi is the main gateway. Domestic flights connect Nairobi to the Maasai Mara’s airstrips and to the coast (Mombasa, or Ukunda for Diani); the drive from Nairobi to the Mara takes five to six hours on roads that get rough in the final stretch, so most visitors fly. Transport inside reserves is by 4x4 with a driver-guide.',
    visaInfo: '[VERIFY, source: U.S. Embassy Kenya, checked August 2026] Kenya no longer issues visas on arrival. All visitors must apply for an eVisa online before departure through the government’s official portal; there is no exception for short tourist stays. Passports need at least two blank pages and six months’ validity. Source: ke.usembassy.gov.',
    safetyInfo: '[VERIFY, source: U.S. Department of State, checked August 2026] Kenya’s advisory was renewed at Level 2, Exercise Increased Caution, in July 2026, citing crime, kidnapping, terrorism, civil unrest, and road safety. Specific areas carry a higher Level 3/4 designation, including parts of Nairobi (Eastleigh, Kibera), counties bordering Somalia and South Sudan, and the coast north of Malindi; the main safari and beach circuit (Maasai Mara, central Nairobi, Diani, Watamu) sits outside these zones. Check the current advisory map before finalising an itinerary. Source: ke.usembassy.gov.',
    startHere: ['masai-mara-national-reserve-kenya', 'amboseli-national-park-kenya', 'diani-beach-kenya'],
  },
  'country-ethiopia': {
    overview: 'Ethiopia was never colonised, and it shows: a thirteen-month calendar, a language and script found nowhere else, rock-hewn churches still in active worship, and a highland landscape that looks nothing like the safari plains most visitors expect from East Africa.',
    whenToGo: 'October to March is the main dry season across the highlands and the easiest time to travel, including trekking in the Simien Mountains. The rains, roughly June to September, turn the country genuinely green and swell the Blue Nile Falls near Bahir Dar, but road travel gets harder outside the cities during this period.',
    knownFor: 'The eleven monolithic rock-hewn churches of Lalibela, carved downward into volcanic rock in the twelfth century and still an active pilgrimage site, the Simien Mountains’ escarpments and endemic wildlife including gelada monkeys and the Walia ibex, and coffee, which by most historical accounts originates in Ethiopia’s Kaffa region.',
    surprises: 'Ethiopia runs on its own calendar, roughly seven to eight years behind the Gregorian calendar, and its own clock convention, starting the day at what Western visitors would call 6am. Addis Ababa sits above 2,300 metres, high enough that altitude affects some visitors before they leave the capital. The Danakil Depression, one of the hottest and lowest places on earth with active lava lakes, is a real, bookable multi-day trip, not a metaphor.',
    gettingAround: 'Addis Ababa Bole International Airport (ADD) is the main gateway and Ethiopian Airlines’ hub. Domestic flights are the practical way to cover a country this large, since road distances between highlight regions (Lalibela, the Simiens, the Danakil) are long and often on rough roads.',
    visaInfo: '[VERIFY, source: U.S. Embassy Ethiopia, checked August 2026] All visitors need a visa. The e-visa, applied for online in advance, is the standard route for tourists; passports should be valid at least six months beyond entry. Source: et.usembassy.gov.',
    safetyInfo: '[VERIFY, source: U.S. Department of State, checked August 2026] The advisory for Ethiopia stands at Level 3, Reconsider Travel, citing unrest, crime, kidnapping, terrorism, landmines in some regions, and reports of exit fees as high as $3,000 in specific circumstances. Travel to the Tigray region carries additional restrictions. This is a country-wide level; the standard Addis-Lalibela-Simien route is not itself a conflict zone, but check the current advisory and regional guidance before travel. Source: et.usembassy.gov (travel advisory update, April 2026).',
    startHere: ['lalibela-rock-hewn-churches-ethiopia-att-0103', 'simien-mountains-ethiopia', 'addis-ababa-ethiopia'],
  },
  'country-south-africa': {
    overview: 'South Africa covers enough climate and landscape to function as several countries in one trip: Cape Town and the Cape Peninsula, the Garden Route along the southern coast, and Kruger National Park’s big-game safari circuit in the northeast.',
    whenToGo: 'May to September, the dry winter, is the best window for game viewing in Kruger, when thinner bush and animals clustering at water sources make sightings easier. Cape Town’s summer, November to March, is the better season for the city, the Winelands and the coast. The two seasons run close to inverted, so a single trip covering both needs planning around which half gets priority.',
    knownFor: 'Table Mountain and the Cape Peninsula, Kruger National Park as one of Africa’s largest and most accessible big-five reserves, and Robben Island, where Nelson Mandela was imprisoned for eighteen of his twenty-seven years, now a museum and UNESCO World Heritage Site.',
    surprises: 'Cape Town and Kruger are roughly a two-hour flight apart, not a road trip; most itineraries fly rather than self-drive between the coast and the safari region. South Africa has three capital cities (Pretoria, Cape Town, Bloemfontein), splitting the executive, legislative and judicial functions. Self-drive safari is genuinely possible on much of Kruger’s paved road network, unlike the 4x4-only reserves elsewhere on the continent.',
    gettingAround: 'Cape Town International (CPT) and OR Tambo International in Johannesburg (JNB) are the main gateways. Kruger has its own regional airports (Skukuza, Kruger Mpumalanga) with direct flights from Johannesburg and Cape Town. The Garden Route between Cape Town and Port Elizabeth is a genuine self-drive route on good roads; Kruger itself allows self-drive on tarred roads inside the park.',
    visaInfo: '[VERIFY, source: U.S. Embassy South Africa, checked August 2026] U.S. citizens do not need a visa for tourism or business stays of 90 days or less. Passports must be valid at least 30 days beyond the exit date and carry two consecutive blank visa pages. As of July 2026, all travellers must submit an online traveller declaration within 24 hours of departure. Source: za.usembassy.gov.',
    safetyInfo: '[VERIFY, source: U.S. Department of State / OSAC, checked August 2026] South Africa’s advisory stands at Level 2, Exercise Increased Caution, citing crime, terrorism, unrest and kidnapping, with crime concentrated in specific urban areas rather than spread evenly nationwide. The main tourist areas of Cape Town, the Garden Route and Kruger see large visitor numbers every year without incident, but standard city precautions apply, especially around Johannesburg and central Cape Town after dark. Source: osac.gov.',
    startHere: ['table-mountain-south-africa', 'kruger-national-park-south-africa', 'robben-island-south-africa'],
  },
  'country-egypt': {
    overview: 'Egypt’s ancient sites, the Pyramids of Giza, Luxor’s temple complexes, Abu Simbel, sit alongside a Red Sea coast built for diving, and a Nile that has organised life along its banks for thousands of years.',
    whenToGo: 'October to April is the main season, when daytime temperatures at Giza, Luxor and Aswan are manageable; December and January are the coolest and busiest months. May to September gets extremely hot away from the coast, regularly over 40°C in Luxor and Aswan, though the Red Sea resorts stay swimmable and busy through summer.',
    knownFor: 'The Pyramids of Giza and the Sphinx, the only surviving Ancient Wonder of the World, the temple complexes of Luxor and Karnak on the Nile’s east bank, and the Red Sea coast around Hurghada and Sharm el-Sheikh for diving and snorkelling.',
    surprises: 'The Pyramids sit at the edge of greater Cairo, not in remote desert; the city is visible from the plateau. A Nile cruise between Luxor and Aswan is the standard, practical way to see several major sites in sequence, not a luxury add-on. Cairo’s traffic and pace can be a real adjustment on day one, more intense than most first-time visitors expect from photos of the monuments alone.',
    gettingAround: 'Cairo International Airport (CAI) is the main gateway. Domestic flights connect Cairo to Luxor, Aswan and the Red Sea resorts; the Cairo-Luxor-Aswan route is also covered by an overnight sleeper train and by Nile cruise boats that combine transport with the sightseeing itself. Cairo traffic makes short distances slow, and most visitors use hotel transfers or ride-hailing apps rather than self-drive.',
    visaInfo: '[VERIFY, source: travel.state.gov, checked August 2026] A visa is required for all visitors. Most nationalities can get a 30-day tourist visa on arrival at Cairo airport, paid in U.S. dollars cash, or apply for an e-visa online in advance, which avoids the arrival queue. Source: travel.state.gov Egypt country page.',
    safetyInfo: '[VERIFY, source: U.S. Department of State, checked August 2026] Egypt’s overall advisory is Level 2, Exercise Increased Caution. Two specific areas carry a Level 4, Do Not Travel designation: the Northern and Middle Sinai Peninsula outside the resort zone of Sharm el-Sheikh, and parts of the Western Desert near the Libyan border. The Nile Valley route (Cairo, Luxor, Aswan) and the main Red Sea resorts fall outside these zones. Source: travel.state.gov Egypt travel advisory.',
    startHere: ['pyramids-of-giza-egypt', 'cairo-egypt', 'alexandria-egypt'],
  },
  'country-morocco': {
    overview: 'Morocco packs the Sahara, the Atlas Mountains, and Atlantic and Mediterranean coastlines into a country small enough to cross in a week, anchored by Marrakech’s medina and souks.',
    whenToGo: 'March to May and September to November are the best months, with mild temperatures in Marrakech and the Atlas foothills and manageable heat if heading into the Sahara. Summer (June to August) is very hot inland, regularly over 40°C in Marrakech and the desert, though the Atlantic coast at Essaouira stays cooler. Winter nights in the Sahara and the Atlas Mountains drop close to freezing even when days are warm.',
    knownFor: 'Marrakech’s medina and souks, the Sahara Desert dunes around Merzouga, typically reached via an overnight camp, and Chefchaouen, the mountain town painted almost entirely in shades of blue.',
    surprises: 'Merzouga’s dunes are a genuine multi-hour drive from Marrakech, roughly seven to nine hours, usually broken into a two-day trip via the Atlas Mountains and the Dadès or Todra Gorges, not a day trip. Morocco is close enough to Europe that a short flight from several Spanish or French cities lands directly in Marrakech, making it a common quick-break destination as well as a long-haul one. Bargaining is the norm, not the exception, in the souks; posted prices are frequently a starting point.',
    gettingAround: 'Marrakech Menara Airport (RAK) and Casablanca’s Mohammed V (CMN) are the main gateways. Morocco has a real intercity rail network (ONCF) connecting Casablanca, Rabat, Marrakech, Fez and Tangier; reaching the Sahara or the smaller mountain towns typically means a private driver or organised tour rather than rail or self-drive on unfamiliar mountain roads.',
    visaInfo: '[VERIFY, source: travel.state.gov, checked August 2026] U.S. citizens do not need a visa for stays up to 90 days. Travellers must exit before the 90 days expires or formally request an extension; overstaying can bar future entry until resolved with an immigration judge. Source: travel.state.gov Morocco country page.',
    safetyInfo: '[VERIFY, source: U.S. Department of State, checked August 2026] Morocco’s advisory is Level 2, Exercise Increased Caution, citing terrorism risk. The State Department notes that groups have plotted attacks with little or no warning, historically targeting tourist locations, transport hubs and markets, though no specific current plot is cited for Marrakech or the main tourist circuit; general situational awareness in crowded public places applies. Source: travel.state.gov Morocco travel advisory.',
    startHere: ['marrakech-souks-morocco', 'sahara-desert-at-merzouga-morocco', 'chefchaouen-morocco'],
  },
  'country-namibia': {
    overview: 'Namibia is one of the least densely populated countries on earth, built around the Namib Desert’s red dunes at Sossusvlei, the wildlife of Etosha National Park, and the fog-bound Skeleton Coast.',
    whenToGo: 'May to October, the dry season, is the best window for wildlife viewing at Etosha, when animals concentrate around waterholes. This period also brings cooler desert temperatures at Sossusvlei, more comfortable for the dune climbs, which get very hot from November to March.',
    knownFor: 'Sossusvlei and Deadvlei’s red dunes and the white, cracked clay pan studded with centuries-old dead camelthorn trees, Etosha National Park’s waterhole-based game viewing around a vast salt pan, and the Skeleton Coast, named for the shipwrecks and whale bones exposed along it.',
    surprises: 'Namibia is genuinely vast and empty; driving distances between major sites, Windhoek to Sossusvlei, Sossusvlei to Etosha, run five or more hours, and self-drive is common and practical on well-maintained gravel roads, unusual for the region. As of April 2025, U.S. tourists need a visa to enter, reversing the previous visa-free arrangement, which catches some returning visitors off guard. Namibia was a German colony until the First World War, and German-influenced architecture and place names are still visible in Windhoek and Swakopmund.',
    gettingAround: 'Hosea Kutako International Airport (WDH) near Windhoek is the main gateway. Self-drive is the standard way to see Namibia, on a mix of paved and well-graded gravel roads connecting Windhoek, Sossusvlei, Swakopmund and Etosha; a 4x4 is recommended though not always required outside the rainy season.',
    visaInfo: '[VERIFY, source: U.S. Embassy Namibia, checked August 2026] Since April 1, 2025, U.S. citizen tourists need a visa to enter Namibia, a change from the previous visa-free policy. Applying in advance through Namibia’s online visa portal is recommended to avoid delays on arrival; a minimum of three blank passport pages is required. Source: na.usembassy.gov.',
    safetyInfo: '[VERIFY, source: U.S. Department of State, checked August 2026] Namibia’s advisory is Level 2, Exercise Increased Caution, citing crime and health-related concerns rather than terrorism or unrest. Namibia is generally considered one of the more stable, lower-crime destinations in the region for the main tourist circuit, with standard precautions applying in Windhoek after dark. Source: travel.state.gov Namibia country page.',
    startHere: ['sossusvlei-and-deadvlei-namibia', 'fish-river-canyon-namibia', 'windhoek-namibia'],
  },
  'country-ghana': {
    overview: 'Ghana anchors West Africa’s Gulf of Guinea coast, where Cape Coast Castle’s role in the Atlantic slave trade and Accra’s markets and live-music scene sit within a couple of hours of each other.',
    whenToGo: 'November to March, the dry season, is the most comfortable window, with less humidity than the rainy months. The main rains run roughly April to July, heaviest in the south; the harmattan, a dry, dusty wind from the Sahara, can reduce visibility from December into January.',
    knownFor: 'Cape Coast Castle and Elmina Castle, UNESCO-listed former slave-trading forts now sites of memory and pilgrimage, particularly for the African diaspora, Kakum National Park’s rainforest canopy walkway, and kente cloth, the woven textile with roots among the Ashanti and Ewe peoples.',
    surprises: 'Ghana actively markets itself to the African diaspora as a place of return, formalised in initiatives like the 2019 Year of Return marking 400 years since the first recorded enslaved Africans arrived in Virginia; Cape Coast and Elmina castles are built for this kind of visit, not only historical tourism. Accra’s live-music scene, particularly Afrobeats and highlife, is a real draw in its own right, separate from the historical sites. English is Ghana’s official language, a legacy of British colonial rule, which makes it one of the more straightforward West African countries to navigate without French.',
    gettingAround: 'Kotoka International Airport (ACC) in Accra is the main gateway. Roads connecting Accra to Cape Coast, roughly three hours, and to Kumasi are paved and manageable by private driver or car hire; Ghana does not have an extensive passenger rail network, so road travel is the norm between cities.',
    visaInfo: '[VERIFY, source: travel.state.gov, checked August 2026] A visa is required for U.S. citizens. An e-visa is available online, with standard processing of 5 to 7 business days; a valid yellow fever vaccination certificate is required on arrival. Source: travel.state.gov Ghana country page.',
    safetyInfo: '[VERIFY, source: U.S. Embassy Ghana, checked July 2026] Ghana’s overall advisory is Level 2, Exercise Increased Caution (updated July 7, 2026), citing crime including assault and robbery. Most of the country, including Accra, Cape Coast and Kumasi, carries the lower Level 1 designation; the higher-risk areas are the Upper East, North East and Upper West regions and the western Savannah Region near the Burkina Faso and Côte d’Ivoire borders, well outside the standard coastal and historical tourist route. Source: gh.usembassy.gov.',
    // Only 2 real published attractions exist for Ghana in the database right
    // now — leaving this at 2 rather than inventing a third reference.
    startHere: ['cape-coast-castle-ghana', 'accra-ghana'],
  },
}

async function main() {
  console.log(`Setting countryCode on ${Object.keys(COUNTRY_CODES).length} countries...`)
  let tx = client.transaction()
  for (const [id, code] of Object.entries(COUNTRY_CODES)) {
    tx = tx.patch(id, p => p.set({ countryCode: code }))
  }
  await tx.commit()
  console.log('countryCode set on all countries.')

  console.log(`\nResolving attraction slugs to _id for ${Object.keys(OVERVIEWS).length} countries...`)
  const allSlugs = Object.values(OVERVIEWS).flatMap(o => o.startHere)
  const attractionDocs = await client.fetch(
    '*[_type=="attraction" && slug.current in $slugs]{_id, "slug": slug.current}',
    { slugs: allSlugs }
  )
  const slugToId = Object.fromEntries(attractionDocs.map(a => [a.slug, a._id]))
  const missing = allSlugs.filter(s => !slugToId[s])
  if (missing.length) {
    console.error('ERROR: could not resolve these attraction slugs, aborting:', missing)
    process.exit(1)
  }

  console.log('\nWriting overview content for the 8-country batch...')
  let tx2 = client.transaction()
  for (const [id, data] of Object.entries(OVERVIEWS)) {
    const { startHere, ...fields } = data
    const refs = startHere.map(slug => ({
      _type: 'reference',
      _ref: slugToId[slug],
      _key: slugToId[slug],
    }))
    tx2 = tx2.patch(id, p => p.set({ ...fields, startHereAttractions: refs }))
  }
  const result = await tx2.commit()
  console.log('Overview content written. Transaction result:', result.transactionId)
}

main().catch(e => {
  console.error('FAILED:', e)
  process.exit(1)
})
