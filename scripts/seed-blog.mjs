/**
 * Seeds 2 fictional African authors and 10 editorial blog posts into Sanity.
 * Run with: node --env-file=.env.local scripts/seed-blog.mjs
 *
 * The script is idempotent: it checks by slug before creating and skips
 * any document that already exists.
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'k2ysdc2b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

function key() {
  return Math.random().toString(36).slice(2, 10)
}

function b(text, style = 'normal') {
  return {
    _type: 'block',
    _key: key(),
    style,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}

// ── Authors ───────────────────────────────────────────────────────────────────

const AUTHORS = [
  {
    _type: 'author',
    name: 'Amara Diallo',
    slug: { _type: 'slug', current: 'amara-diallo' },
    bio: 'Amara Diallo is a Lagos-based travel writer and cultural journalist. She covers food, markets, festivals, and the rhythms of West African city life.',
    role: 'Contributing Writer',
  },
  {
    _type: 'author',
    name: 'Nkosi Dlamini',
    slug: { _type: 'slug', current: 'nkosi-dlamini' },
    bio: 'Nkosi Dlamini is a Johannesburg-based journalist and outdoor writer. He has traveled extensively through Southern Africa covering wilderness areas, colonial history, and conservation stories.',
    role: 'Contributing Writer',
  },
]

// ── Posts ─────────────────────────────────────────────────────────────────────

function buildPosts(amaraId, nkosiId) {
  const amara = { _type: 'reference', _ref: amaraId }
  const nkosi = { _type: 'reference', _ref: nkosiId }

  return [
    // 1
    {
      _type: 'post',
      title: 'Everything You Think You Know About Lagos Traffic Is Wrong',
      slug: { _type: 'slug', current: 'lagos-traffic-guide' },
      publishedAt: '2026-05-12T08:00:00Z',
      contentStatus: 'Published',
      excerpt: 'Lagos moves differently from any other city. Learning to read it is the first skill every visitor needs.',
      category: 'Travel Planning',
      tags: ['Lagos', 'Nigeria', 'West Africa', 'City Travel'],
      author: amara,
      metaTitle: 'Lagos Traffic: What Every Visitor Needs to Know',
      metaDescription: 'Lagos traffic is not just a logistical challenge. It is a cultural institution with its own rules, rhythms, and rewards for those who learn to read it.',
      focusKeyword: 'Lagos traffic guide for visitors',
      body: [
        b('The advice is always the same. Arrive early. Take the Third Mainland Bridge at dawn. Avoid Lagos Island on a Friday afternoon. Most of it is true and none of it is enough.'),
        b('Lagos traffic is not simply a logistical problem. It is a cultural institution. The go-slow, as it is called locally, is where business is conducted through car windows, where hawkers move between lanes selling phone chargers and boiled groundnuts, where friendships are maintained by honking in a language visitors never learn.'),
        b('Learning the Rhythms', 'h2'),
        b('The city runs in patterns that take time to read. The rush east from the Island happens later than in most cities. The return from the mainland in the evening is its own phenomenon. Understanding the direction of traffic at any given hour saves more time than any shortcut.'),
        b('The Danfo Alternative', 'h2'),
        b('The yellow buses called danfo move differently from private cars. They follow routes that do not appear on any map but that every Lagosian knows by instinct. Learning even two or three routes gives you a mobility that no ride-hailing app can provide.'),
        b('Lagos does not reward impatience. The traveler who accepts that getting somewhere will take the time it takes will find the city generous. The traveler who fights it will lose.'),
      ],
    },
    // 2
    {
      _type: 'post',
      title: 'The Markets of Kumasi at Dawn',
      slug: { _type: 'slug', current: 'kumasi-markets-dawn' },
      publishedAt: '2026-05-19T08:00:00Z',
      contentStatus: 'Published',
      excerpt: "Kumasi's Kejetia Market never truly sleeps. By four in the morning, the day's trade has already begun.",
      category: 'Destinations',
      tags: ['Ghana', 'Kumasi', 'Markets', 'West Africa'],
      author: amara,
      metaTitle: "Kumasi's Kejetia Market at Dawn – MyAfroWaka",
      metaDescription: "The best time to visit Kumasi's Kejetia Market is before most visitors are awake. What happens at dawn in one of West Africa's great trading centres.",
      focusKeyword: 'Kumasi Kejetia Market guide',
      body: [
        b("Kumasi's Kejetia Market operates on a schedule that begins long before sunrise. By four in the morning, the earliest traders are already in position, arranging cloth and produce on surfaces that will overflow within the hour."),
        b("The Kejetia is considered one of the largest covered markets in West Africa. Walking through it in daylight is overwhelming. Walking through it at dawn, when only a fraction of the stalls are open and the light is still deep orange from portable lanterns, is something else entirely."),
        b('Cloth and Color', 'h2'),
        b('The Kente weavers arrive early. Their stalls are at the northern end of the market, near the bus terminus. The cloth they sell ranges from the ceremonial to the everyday, and the weavers can tell the difference between a buyer who wants to understand and a buyer who wants to photograph.'),
        b('Take the time to understand. Ask which patterns are for funerals and which are for celebrations. Ask which colors belong to royalty. The conversation is part of the market.'),
        b('Food Before the Crowds', 'h2'),
        b('The food stalls around the perimeter open earliest. Thick porridge served with groundnut soup is a dawn tradition in Kumasi. The women who serve it have been there since three in the morning. Sitting with them and eating before the city fully wakes is a privilege that belongs only to those who show up early enough.'),
      ],
    },
    // 3
    {
      _type: 'post',
      title: 'Slow Travel in Rwanda: What Six Weeks Taught Me',
      slug: { _type: 'slug', current: 'slow-travel-rwanda' },
      publishedAt: '2026-05-26T08:00:00Z',
      contentStatus: 'Published',
      excerpt: 'Rwanda rewards the traveler who resists the urge to tick every box. Slowing down reveals a country far more complex than its reputation.',
      category: 'Travel Planning',
      tags: ['Rwanda', 'East Africa', 'Slow Travel', 'Kigali'],
      author: nkosi,
      metaTitle: 'Six Weeks of Slow Travel in Rwanda – MyAfroWaka',
      metaDescription: 'What Rwanda reveals when you stop rushing through it. Notes on slow travel, Kigali neighborhoods, and the country beyond the tourist checklist.',
      focusKeyword: 'slow travel Rwanda',
      body: [
        b('Most visitors to Rwanda come with a list: gorilla tracking in the Virunga mountains, the genocide memorials in Kigali, Lake Kivu at sunset. The list is a good list. It does not prepare you for what happens when you stay long enough to stop using one.'),
        b("Six weeks in Rwanda is long enough to move past the obvious. Long enough to develop a neighborhood routine in Kigali's Kimihurura district. Long enough to take the same bus south to Butare on three separate occasions and notice different things each time."),
        b('The Kindness of Bureaucracy', 'h2'),
        b('Rwanda is an organized country. This surprises travelers who arrive from other parts of East Africa, where paperwork is a performance. Here the roads are maintained, the rules are followed, and the administrative process does not consume your entire morning.'),
        b('This orderliness is a deliberate policy choice, not an accident. Understanding its history, and what the country has deliberately built toward since 1994, makes the orderliness feel different from the surface efficiency it might otherwise appear to be.'),
        b('What You Miss When You Rush', 'h2'),
        b("Rwanda's landscape deserves more than a view from a bus window. The country is small, and moving slowly through it reveals a density of life that quick transits hide. The hills genuinely roll. The agriculture is terraced all the way to the ridge. These are not travel-brochure abstractions."),
      ],
    },
    // 4
    {
      _type: 'post',
      title: 'The Desert Light of Namibia',
      slug: { _type: 'slug', current: 'namibia-desert-light' },
      publishedAt: '2026-06-02T08:00:00Z',
      contentStatus: 'Published',
      excerpt: 'In the Namib, light is the main character. Everything else, the dunes, the dry riverbeds, the distant kopjes, exists only to catch it.',
      category: 'Experiences',
      tags: ['Namibia', 'Namib Desert', 'Southern Africa', 'Photography', 'Sossusvlei'],
      author: nkosi,
      metaTitle: 'The Desert Light of Namibia: A Photography and Travel Guide',
      metaDescription: "What makes Namibia's Namib Desert extraordinary is not the scale but the light. A guide to understanding what dawn and midday do to the landscape.",
      focusKeyword: 'Namibia desert travel guide',
      body: [
        b("Namibia's Namib Desert is primarily a light experience. The landforms matter, the scale matters, the silence matters. But the thing that photographs fail to communicate is what the light does to all of it."),
        b('The dunes at Sossusvlei change color from before sunrise to well after. The same ridge that is a deep red at six in the morning becomes pale orange by nine and near-white at noon. Returning to the same viewpoint at different hours of the same day produces images that look like different places.'),
        b('Before Sunrise', 'h2'),
        b('The gate to Sossusvlei opens at sunrise. The sensible approach is to be at the gate before it opens. The first forty minutes of light, before the tourist vehicles arrive in volume, belongs to whoever arrived earliest. That window is the reason to come to this part of the Namib.'),
        b('Deadvlei at Midday', 'h2'),
        b('Deadvlei is the white clay pan with the famous dead camel thorn trees. Most visitors photograph it in the morning light. Fewer stay until midday, when the light becomes flat and harsh and the white of the pan turns near-blinding. That version of Deadvlei is its own strange beauty, undervisited and genuinely alien.'),
        b('The walk back from Deadvlei in the midday heat reminds you that the desert is not a backdrop. It is a climate, a system, an argument with human comfort that the desert always wins.'),
      ],
    },
    // 5
    {
      _type: 'post',
      title: 'Suya, Jollof, and the Argument That Never Ends',
      slug: { _type: 'slug', current: 'west-africa-food-culture' },
      publishedAt: '2026-06-09T08:00:00Z',
      contentStatus: 'Published',
      excerpt: 'West African food culture is built on disagreement. The debates are part of the meal.',
      category: 'Food Tourism',
      tags: ['West Africa', 'Food Culture', 'Nigeria', 'Ghana', 'Jollof Rice'],
      author: amara,
      metaTitle: 'West African Food Culture: Jollof, Suya, and What They Mean',
      metaDescription: 'The Jollof debate, the suya ritual, and the palm oil argument. What West African food culture reveals about identity, pride, and community.',
      focusKeyword: 'West African food culture',
      body: [
        b("The Jollof rice debate between Nigeria and Ghana is not a food fight. It is a cultural institution maintained over decades through genuine conviction and deep mutual affection. Both sides are wrong about the other's rice and right about their own."),
        b('The argument persists because it is not really about rice. It is about pride in cooking traditions that are regional, familial, and deeply tied to identity. The Nigerian version is smoky, cooked in tomato base, richly oiled. The Ghanaian version is cleaner, the rice more distinct. Both are excellent. Neither side will concede the point.'),
        b('Suya as Social Architecture', 'h2'),
        b('Suya is not food eaten alone. The skewered, spiced meat sold by roadside vendors across Nigeria is designed for sharing, for standing around, for the kind of conversation that only happens late at night when the city has slowed. The vendor slices the meat at the skewer, wraps it in newspaper with raw onions and tomatoes, and the transaction is complete in under a minute.'),
        b('Finding the right suya spot is a matter of local knowledge. Every neighborhood has a preferred vendor. Asking a local where to go, and then going precisely there, is the first and only required step.'),
        b('The Palm Oil Debate', 'h2'),
        b('Every West African country has an opinion about palm oil, and the opinion is that the local version is correct and all others are compromised. Red palm oil from Nigeria has a different profile than the version used in Ghana or Cameroon. The differences are real and, to anyone who cooks with it regularly, important.'),
      ],
    },
    // 6
    {
      _type: 'post',
      title: 'What Zanzibar Stone Town Gets Right About Urban Heritage',
      slug: { _type: 'slug', current: 'zanzibar-stone-town-heritage' },
      publishedAt: '2026-06-09T09:00:00Z',
      contentStatus: 'Published',
      excerpt: 'Stone Town has aged in public, which is rare. Most historic places hide behind restoration. Stone Town wears its history on the outside.',
      category: 'Culture & Heritage',
      tags: ['Tanzania', 'Zanzibar', 'Stone Town', 'Heritage', 'Architecture'],
      author: amara,
      metaTitle: 'Zanzibar Stone Town: What Heritage Looks Like When It Lives',
      metaDescription: 'Stone Town has not been preserved in the museum sense. It has been lived in, worn, and adapted. What this means for the traveler who wants to understand it.',
      focusKeyword: 'Zanzibar Stone Town travel guide',
      body: [
        b("Stone Town's most interesting quality is its unwillingness to choose a single face. The buildings show Swahili, Omani, Indian, and British influence in layers that are visible even without historical knowledge. The streets are narrow enough that two people walking abreast must turn sideways to pass."),
        b('Heritage cities in other parts of the world tend toward the museum. They are preserved, curated, explained. Stone Town has been preserved without being sealed. People live in the old buildings. Laundry dries between carved window frames. The call to prayer competes with the sound of school children.'),
        b('The Doors', 'h2'),
        b("The carved wooden doors of Stone Town are the most-photographed element of the island's heritage. They are worth the attention. The older Omani-style doors have circular brass bosses. The later Indian-style doors are more elaborate and reveal a different wave of settler influence in the architecture."),
        b("The best way to understand the doors is to walk without a map and look at them closely. The condition of the carving tells you something about the building's current fortunes. The door of a thriving household is maintained. Others have been replaced with something more practical."),
        b('The Darajani Market', 'h2'),
        b("Darajani Market is where Stone Town's heritage is least interested in tourism. Spices, fish, vegetables, and second-hand goods occupy separate sections. The spice trade that made Zanzibar significant still has a physical presence here, even if the scale has changed completely."),
      ],
    },
    // 7
    {
      _type: 'post',
      title: 'Tracking Without Guides: The Ethics of Self-Guided Safari',
      slug: { _type: 'slug', current: 'self-guided-safari-ethics' },
      publishedAt: '2026-06-16T08:00:00Z',
      contentStatus: 'Published',
      excerpt: 'The safari industry is built on mediation. A guide stands between the traveler and the wild. Removing that layer changes everything.',
      category: 'Experiences',
      tags: ['Safari', 'Southern Africa', 'Wildlife', 'Travel Ethics', 'Botswana'],
      author: nkosi,
      metaTitle: 'Self-Guided Safari: Ethics, Gain, and What You Give Up',
      metaDescription: 'In many Southern African parks, self-drive safaris are permitted. This changes the experience in ways that go beyond the absence of a guide.',
      focusKeyword: 'self-drive safari Southern Africa',
      body: [
        b('In most national parks across Southern Africa, self-drive safaris are permitted. You take your own vehicle, follow the designated roads, observe the wildlife, and leave without a guide between you and the experience. This is common. It is also deeply different from the guided experience, and not always in the ways people assume.'),
        b("The argument for guided safaris is expertise. A trained guide reads the landscape in ways that take years to develop. They see the grass pressed down where a leopard rested an hour ago. They know which termite mound to approach slowly. They understand the difference between an elephant that is feeding and an elephant that is about to tell you to leave."),
        b('What You Gain Without a Guide', 'h2'),
        b('The self-drive experience offers something different. Silence, for one. The vehicle does not move until you decide to move it. You can sit in front of a water hole for four hours if that is what interests you. No other guests to accommodate, no schedule, no commentary unless you provide it.'),
        b('Self-drive safaris also produce a different quality of attention. Without someone else interpreting the landscape, you are forced to use your own senses. You miss some things. You notice others that a guide, focused on performance, might have passed.'),
        b('The Ethical Dimension', 'h2'),
        b('The safari industry provides income and employment in communities adjacent to protected areas. The decision to self-drive is a decision that affects those communities. This is not an argument against self-drive safaris. It is an argument for understanding what the fee structure of a guided experience supports, and making the choice deliberately.'),
      ],
    },
    // 8
    {
      _type: 'post',
      title: 'The Cape Winelands Are Not What They Sell You',
      slug: { _type: 'slug', current: 'cape-winelands-reality' },
      publishedAt: '2026-06-16T09:00:00Z',
      contentStatus: 'Published',
      excerpt: 'The postcards show rolling vineyards and Cape Dutch gables. The real Winelands is more complicated, and more interesting for it.',
      category: 'Destinations',
      tags: ['South Africa', 'Western Cape', 'Cape Winelands', 'Stellenbosch', 'Franschhoek'],
      author: nkosi,
      metaTitle: 'The Cape Winelands Beyond the Brochure – MyAfroWaka',
      metaDescription: "The Cape Winelands are beautiful and their history is complicated. What travelers need to know about the landscape between the vineyards.",
      focusKeyword: 'Cape Winelands travel guide',
      body: [
        b('The marketing image of the Cape Winelands is consistent and effective. Whitewashed Cape Dutch gables, vineyards in autumn color, mountain backdrops, wine glasses catching afternoon light. It is a real image. It is also incomplete in ways that matter to the traveler who wants to understand a place rather than simply visit it.'),
        b('The wine farms of Stellenbosch, Franschhoek, and Paarl occupy land with a complicated history. The laborers who planted and maintained the vines through the apartheid era lived in conditions the wine labels do not discuss. The communities adjacent to the vineyards carry the legacy of that history in ways that are visible if you spend time outside the estates.'),
        b("Franschhoek's Double Life", 'h2'),
        b('Franschhoek means French Corner, named for the Huguenot refugees who settled here in the late seventeenth century. The town presents itself primarily as a food and wine destination and does this with real distinction. The restaurants here have a sustained quality that is among the best in the country.'),
        b('The Huguenot Memorial Museum in the town center is small but honest about the colonial history of the valley. It is one of the few places in the Winelands where the full timeline of who owned this land and how it changed hands is presented directly.'),
        b('Pairing Food and History', 'h2'),
        b('The best approach to the Winelands is to hold both realities at once. The wine is genuinely excellent. The landscape is genuinely beautiful. And the history of who built it, who was excluded from owning it, and who still faces structural disadvantages because of that exclusion is genuinely important. None of these facts cancels the others.'),
      ],
    },
    // 9
    {
      _type: 'post',
      title: 'Learning to Bargain in a Moroccan Medina',
      slug: { _type: 'slug', current: 'morocco-medina-bargaining' },
      publishedAt: '2026-06-23T08:00:00Z',
      contentStatus: 'Published',
      excerpt: 'The medina has its own economy, its own language, and its own rules. Ignoring them costs you more than money.',
      category: 'Travel Planning',
      tags: ['Morocco', 'Marrakech', 'North Africa', 'Medina', 'Culture'],
      author: amara,
      metaTitle: 'How to Bargain in a Moroccan Medina – MyAfroWaka',
      metaDescription: 'Bargaining in the souks of Marrakech is not optional. It is the vocabulary of commerce. A guide to participating correctly and respectfully.',
      focusKeyword: 'Morocco medina bargaining guide',
      body: [
        b('The medina of Marrakech is built for transactions. Every lane, every turn, every doorway that opens onto an apparently private courtyard is part of a commercial architecture developed over centuries. Walking into it without understanding the rules costs you money and, more importantly, the experience of a genuine exchange.'),
        b('The first rule is that the first price is not the real price. This is not deception. It is an opening position in a negotiation that both parties are expected to participate in. Accepting the first price signals that you are not participating, and the vendor loses interest or, worse, thinks they underpriced the item.'),
        b('The Counter-Offer', 'h2'),
        b('The counter-offer should be significantly lower than the opening price. Not insulting, but genuinely lower. The acceptable counter-offer percentage varies by category: more negotiation room for leather goods, less for spices, almost none for food. Learning these distinctions takes time and the willingness to accept that you will sometimes get it wrong.'),
        b('The rule about walking away is true. If you name your price and the vendor refuses, leaving often brings them to your number before you reach the next stall. It also sometimes does not. That is a risk built into the process.'),
        b('When Not to Bargain', 'h2'),
        b('Fixed-price shops exist in the medina and they are marked, sometimes with a sign, sometimes just by the lack of invitation to negotiate. Bargaining in these shops is inappropriate. Learning to read which context you are in is part of the skill the medina is actually teaching you.'),
      ],
    },
    // 10
    {
      _type: 'post',
      title: 'The Sound of Addis Ababa at Night',
      slug: { _type: 'slug', current: 'addis-ababa-night-sound' },
      publishedAt: '2026-06-23T09:00:00Z',
      contentStatus: 'Published',
      excerpt: 'Every city has a sound that belongs only to it. In Addis Ababa, that sound changes completely after dark.',
      category: 'Experiences',
      tags: ['Ethiopia', 'Addis Ababa', 'East Africa', 'City Life', 'Culture'],
      author: amara,
      metaTitle: 'Addis Ababa After Dark: The City You Hear at Night',
      metaDescription: 'Addis Ababa sounds different after dark. The music, the markets, and the liturgical sounds of the Ethiopian Orthodox Church layer into something specific to this city.',
      focusKeyword: 'Addis Ababa travel guide night',
      body: [
        b('Addis Ababa at night sounds different from Addis Ababa in the afternoon. The city does not quiet down in the way that visitors accustomed to European urban rhythms expect. It shifts register, like a conversation that has moved from the formal to the relaxed.'),
        b('The bars of Bole Road in the south of the city open their sound into the street. The music is Ethiopian and it is specific: Amharic lyrics over instrumentation that borrows from jazz without becoming jazz. This is the music of the tej houses where fermented honey wine is served, but it has moved into the contemporary city without losing its particular quality.'),
        b('The Dawn Call', 'h2'),
        b("The Ethiopian Orthodox Church wakes before the city does. The sound from the churches in the early morning, before four in the morning, is the first layer of the day's soundscape. It rises and falls without amplification and carries in the thin high-altitude air in ways it would not in a coastal city."),
        b('Merkato at Closing Time', 'h2'),
        b('The Merkato, considered one of the largest open-air markets in Africa, operates until early evening and then collapses in on itself with surprising speed. The sound of it closing, the shouting of final transactions, the movement of carts, the rolling down of corrugated metal shutters, is as distinct as the sound of it opening.'),
        b('Addis Ababa is a city that rewards auditory attention. The traveler who listens, not just looks, will find a different version of the city from the one the guidebooks describe.'),
      ],
    },
  ]
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function run() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('SANITY_API_WRITE_TOKEN is not set. Run with: node --env-file=.env.local scripts/seed-blog.mjs')
    process.exit(1)
  }

  console.log('Creating authors...')

  const authorDocs = await Promise.all(
    AUTHORS.map(async author => {
      const existing = await client.fetch(
        `*[_type == "author" && slug.current == $slug][0]{ _id, name }`,
        { slug: author.slug.current }
      )
      if (existing) {
        console.log(`  Already exists: ${author.name} (${existing._id})`)
        return existing
      }
      const doc = await client.create(author)
      console.log(`  Created: ${author.name} (${doc._id})`)
      return doc
    })
  )

  const [amaraDoc, nkosiDoc] = authorDocs

  console.log('\nCreating posts...')

  const postList = buildPosts(amaraDoc._id, nkosiDoc._id)

  for (const post of postList) {
    const existing = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]{ _id, title }`,
      { slug: post.slug.current }
    )
    if (existing) {
      console.log(`  Already exists: ${existing.title}`)
      continue
    }
    const doc = await client.create(post)
    console.log(`  Created: ${post.title} (${doc._id})`)
  }

  console.log('\nDone. Open Sanity Studio to review all documents.')
}

run().catch(err => {
  console.error(err.message ?? err)
  process.exit(1)
})
