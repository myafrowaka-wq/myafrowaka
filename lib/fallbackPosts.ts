// Fallback blog posts rendered until Sanity seed script is run.
// These are full editorial articles, not placeholders.

export interface FallbackPost {
  title: string
  slug: string
  publishedAt: string
  excerpt: string
  category: string
  tags: string[]
  author: { name: string }
  metaTitle: string
  metaDescription: string
  content: string[]
}

export const FALLBACK_POSTS: FallbackPost[] = [
  {
    title: 'What Lagos Rush Hour Teaches You About African City Life',
    slug: 'lagos-rush-hour-city-life',
    publishedAt: '2025-11-01',
    excerpt: 'Five million journeys a day. The bus, the danfo, the okada, and the man selling credit through your car window. Lagos traffic is not a problem. It is a performance.',
    category: 'Destinations',
    tags: ['Nigeria', 'Lagos', 'Urban Africa', 'West Africa'],
    author: { name: 'Amara Diallo' },
    metaTitle: 'What Lagos Rush Hour Teaches You About African City Life – MyAfroWaka',
    metaDescription: 'Lagos traffic is not dysfunction. It is five million daily acts of improvised logistics, commerce, and community. A field guide to what the city is really doing.',
    content: [
      'Arriving in Lagos, everyone tells you about the traffic. They say it to warn you, to prepare you, to give you a reason to budget three hours where you might need one. What they do not tell you is that the traffic itself is worth studying.',
      'The danfo is the yellow minibus that has been the spine of Lagos public transport for decades. It moves on what its driver decides, responding to demand in real time with no fixed stops and no posted schedule. Every morning, from Badagry to Ikorodu to Alaba, the working population of this city folds itself into these buses and trusts a system that does not exist on paper but runs with extraordinary reliability.',
      'By the time you are sitting on the Third Mainland Bridge at eight in the morning on a weekday, you begin to understand something about Lagos that statistics cannot capture. This is a city of roughly twenty million people moving simultaneously and mostly in pursuit of commerce. The man selling phone credit through your window is not an inconvenience. He is part of the infrastructure. The woman carrying a tray of water sachets through stationary traffic has identified a market, set her price, and gone to work. Both of them are doing what Lagos has always done: adapting.',
      'The okada, the motorcycle taxi, weaves between lanes with the calm of someone who has done this ten thousand times. In some cases, ten thousand times is an underestimate. Every movement in this city has been practiced into a kind of art. Impatience has no utility here. What the city develops in you is a particular form of patience. Not the passive kind. The active kind: the patience of someone who knows the city will eventually deliver, and who uses the waiting time to observe and to sell and to connect.',
      'What Lagos rush hour teaches you is that urban Africa is not waiting to become something. It already is something. The forms are different from what European urban planning imagined cities should look like. The rhythms are different. But the ambition, the productivity, and the ingenuity operating at every intersection are not secondary to those of any other major city on earth.',
      'A city that moves this many people, every single day, largely on improvised infrastructure, is not failing. It is performing a feat of collective organisation that most cities would find impossible. The next time someone shows you Lagos on a map and says it does not work, ask them if they have watched a million people navigate the Third Mainland Bridge as the sun comes up. That is Africa\'s great underreported story: not the dysfunction, but the extraordinary daily competence underneath it.',
    ],
  },
  {
    title: 'Inside Kumasi Central Market: One of West Africa\'s Largest Open-Air Markets',
    slug: 'kumasi-central-market-west-africa',
    publishedAt: '2025-11-10',
    excerpt: 'Somewhere between the kente stalls and the yam pyramids, you understand that Kumasi\'s market is not a shopping destination. It is the city\'s lungs.',
    category: 'Culture & Heritage',
    tags: ['Ghana', 'Kumasi', 'Markets', 'West Africa', 'Culture'],
    author: { name: 'Amara Diallo' },
    metaTitle: 'Inside Kumasi Central Market: West Africa\'s Trading Heart – MyAfroWaka',
    metaDescription: 'Kumasi Central Market in Ghana is one of West Africa\'s largest outdoor trading centres. A guide to navigating it, what to buy, and what it tells you about Ashanti commerce.',
    content: [
      'Kumasi Central Market covers an area so large that first-time visitors often do not realise they are inside it until they are already deep in its corridors. You enter through one of its outer edges, following the noise and the volume of people, and you walk for twenty minutes before arriving at a section that looks nothing like where you started.',
      'The market has operated in some form on this site for centuries. The Ashanti kingdom built Kumasi as a commercial and political capital, and trade was central to how the kingdom organised its power. The current market, rebuilt and expanded several times, reflects that same commercial priority. Sections are grouped by category: cloth, food, hardware, medicine, electronics, shoes. Within each section, competition is visible and immediate. Twenty stalls selling the same dried fish create prices that respond to each other in real time without any formal agreement.',
      'The kente section stops people. Kente cloth is woven by hand in the Bonwire region outside Kumasi, and the market receives it in large quantities. The patterns are not decorative in a casual sense. Each pattern carries meaning: family lineage, occasion, proverb. A seller in the kente section will explain the difference between funeral cloth and celebration cloth. The visual language is specific.',
      'The food section operates at a different pace. Yam tubers are stacked in pyramids that would destabilise most warehouse racking. Tomatoes arrive each morning in quantities that make them look cheap until you realise that the same tomatoes will feed Kumasi for a day. The women who control the food trade are not traders in a casual sense. They are logistics professionals who have mapped supplier networks across the region and know exactly when the next truck arrives from the north.',
      'What Kumasi market teaches you is how a city maintains itself. The formal economy and the informal economy in most West African cities are not two separate things. They are the same economy operating through different channels. The market is where those channels converge. It is supply chain, bank, community centre, and currency exchange, all on the same block, all functioning before nine in the morning.',
      'Navigating it well means letting yourself get lost at least once. Walk past the section you came for. Follow whatever smell or sound draws you. The market rewards the visitor who arrives without a fixed plan and leaves with something they did not know they wanted.',
    ],
  },
  {
    title: 'The Case for Slow Travel in Rwanda',
    slug: 'slow-travel-rwanda',
    publishedAt: '2025-11-20',
    excerpt: 'Most visitors give Rwanda four days. Gorillas on day two, departure on day four. The country deserves a month. Here is what you miss by rushing.',
    category: 'Travel Planning',
    tags: ['Rwanda', 'Slow Travel', 'East Africa', 'Gorilla Trekking'],
    author: { name: 'Nkosi Dlamini' },
    metaTitle: 'The Case for Slow Travel in Rwanda: Why You Need More Than a Week – MyAfroWaka',
    metaDescription: 'Rwanda is often reduced to a gorilla-trekking itinerary. But the country that rebuilt itself from 1994 onward has layers that four days cannot reach. A guide to staying longer.',
    content: [
      'The standard Rwanda itinerary runs something like this: fly into Kigali, spend a night in the city, drive northwest to Volcanoes National Park, trek for gorillas on day two, return to Kigali on day three, fly out on day four. The itinerary works. You see gorillas. You leave satisfied. You have also missed almost everything else.',
      'Rwanda is a small country by African standards, roughly the size of the state of Maryland in the United States or slightly smaller than Wales. But its geography is extreme. The country sits on the Albertine Rift, a branch of the East African Rift System, which gives it a terrain of steep hills and deep valleys that locals call the Land of a Thousand Hills accurately. The hills mean that every view is layered, and that distance on a map corresponds poorly to travel time on the ground.',
      'Kigali itself deserves more than an overnight stop. The city rebuilt its centre after 1994 with a discipline and attention to detail that is visible in its streets. Roadside drainage, consistent electricity, functioning traffic signals, clean pavements: these things exist because of deliberate policy, not because they inherited them. The Kigali Genocide Memorial is not optional if you want to understand what Rwanda is and why it functions the way it does. The memorial is one of the most carefully curated historical sites in Africa. It asks something of you. Give it a morning.',
      'Lake Kivu, in the west of the country, is one of the African Great Lakes and almost unknown to visitors who arrive for gorillas only. The lake runs along the border with the Democratic Republic of Congo and forms a shoreline of small peninsulas and bays where fishing communities have operated for generations. Gisenyi, at the lake\'s northern edge, is a small town with a genuinely pleasant lakefront and not much tourist infrastructure. Eating fresh tilapia grilled at the water\'s edge and watching the fishermen bring in their evening catch is not a curated experience. It is just what happens there every evening.',
      'The Southern Province contains the Nyungwe Forest, one of the oldest rainforests on the African continent. Chimpanzee tracking is available, along with canopy walks through the tree crowns. The forest receives far fewer visitors than Volcanoes and offers a fundamentally different experience: older, quieter, without the structured anticipation of a gorilla encounter.',
      'The case for slow travel in Rwanda is not sentimental. It is practical. The country has invested heavily in roads, accommodation, and safety, making it one of the most accessible countries in the region for independent travel. You have already paid to get there. Stay long enough to use what is available. Four days buys you a certificate on your wall. A month buys you some understanding of where you were.',
    ],
  },
  {
    title: 'What the Namib Desert Looks Like at First Light',
    slug: 'namib-desert-first-light',
    publishedAt: '2025-12-01',
    excerpt: 'The dunes at Sossusvlei are the colour of rust in the late afternoon. At sunrise, before the crowds arrive, they turn a shade that has no name in English.',
    category: 'Experiences',
    tags: ['Namibia', 'Namib Desert', 'Sossusvlei', 'Southern Africa', 'Desert'],
    author: { name: 'Nkosi Dlamini' },
    metaTitle: 'What the Namib Desert Looks Like at First Light – Sossusvlei Guide – MyAfroWaka',
    metaDescription: 'Sossusvlei and the Namib Desert at sunrise is one of Africa\'s most visually striking experiences. A practical guide to timing your visit and what you will find.',
    content: [
      'The gate to Sossusvlei in Namib-Naukluft National Park opens before sunrise. This is deliberate. The park service knows what happens to the light at that hour, and they open the gate so visitors who make the effort can see it. Many visitors do not make the effort. By mid-morning, when the light is flat and the sand is simply orange, they arrive and take their photographs. They have missed the point.',
      'The Namib is considered one of the oldest deserts on earth, with an age estimated at somewhere between fifty-five million and eighty million years. The dunes at Sossusvlei are not static features. They shift with wind, and their shape on any given morning is not exactly the shape they held the morning before. The tallest dunes in the area reach heights of over three hundred metres, making them among the highest in the world.',
      'At first light, roughly thirty minutes before the sun clears the horizon, the dunes begin to change. The base remains in shadow while the crest catches the earliest light. The colour gradient this creates runs from dark burgundy through rust through orange to a pale gold at the very peak. The transition takes less than an hour. If you are already on the dune when it begins, you watch the colour move toward you.',
      'Dead Vlei is a white clay pan inside the dune field that contains the blackened skeletons of camel thorn trees. The trees died roughly nine hundred years ago, when the water sources that sustained them were cut off by shifting dunes. The dry climate preserved them as they stood. They have not decomposed in nine centuries. The combination of white pan, black trees, and rust-coloured dunes behind them is a composition that appears assembled rather than natural. It is completely natural.',
      'The practical information matters. Sossusvlei is roughly five hours by road from Windhoek. The nearest accommodation of any kind is at the Sesriem campsite, just outside the park gate, or at the lodge properties that have access to the park\'s internal road. Booking accommodation close to the park is not a convenience issue. It is the difference between arriving at the gate when it opens and arriving two hours after the interesting light has finished.',
      'What the Namib offers at first light is a specific form of silence that requires some effort to reach. The dunes do not produce this experience for visitors who arrive at ten in the morning with tour groups. They produce it for the person who slept at Sesriem the night before, who set an alarm for four-thirty, and who was standing on sand before the sun showed itself. That person is the one who understands what the Namib actually is.',
    ],
  },
  {
    title: 'West Africa\'s Food Culture Is Not What You Think',
    slug: 'west-africa-food-culture',
    publishedAt: '2025-12-10',
    excerpt: 'Jollof rice is the argument the internet has decided to have. But the real story of West African food is happening in grandmother\'s kitchens and roadside chop bars across the region.',
    category: 'Food Tourism',
    tags: ['West Africa', 'Food', 'Ghana', 'Nigeria', 'Senegal', 'Cuisine'],
    author: { name: 'Amara Diallo' },
    metaTitle: 'West Africa\'s Food Culture: Beyond Jollof Rice – MyAfroWaka',
    metaDescription: 'West African food is one of the most complex and least documented culinary traditions in the world. A guide to what to eat, where, and why the regional variations matter.',
    content: [
      'The jollof rice debate is real and it is taken seriously by the people who participate in it. The argument, roughly, is about which version is best: Ghanaian, Nigerian, or Senegalese. The version that wins social media engagement rotates depending on the month. None of this disagreement tells you very much about West African food, which is considerably more varied and considerably less well documented than the jollof conversation suggests.',
      'The foundation of West African cooking is a set of techniques that developed over centuries and that share certain characteristics across the region: long cooking times, layered spices, palm oil as a base in many dishes, and the use of fermented ingredients that add depth and salinity without salt alone. Dawadawa, a fermented locust bean condiment used across the Sahel and into West Africa\'s coastal countries, has a flavour that has no direct equivalent in European culinary tradition. It is funky in the way that aged cheese is funky: intentionally, productively, deliciously.',
      'Senegal\'s thieboudienne is considered the national dish, a rice dish cooked in tomato and fish broth with vegetables and whole fish that is almost certainly the ancestor of several Caribbean and American rice dishes that arrived with enslaved West Africans in the sixteenth through eighteenth centuries. The version served at a Dakar home and the version served at a restaurant are meaningfully different. At a home, the rice absorbs the broth over a longer period. The crust that forms at the bottom of the pot is considered the prize portion.',
      'In Ghana, the chop bar is the primary institution of everyday food culture. A chop bar is a small, informal restaurant, often run by one or two women, that serves a rotating set of dishes based on what is available and what the cook decided to prepare that day. There is no menu in the conventional sense. You look at the pots and you choose. The food is cooked once, in the morning, and sold until it runs out. This system rewards early arrival and penalises overthinking.',
      'Nigeria\'s food culture is complicated by the country\'s size and internal diversity. Suya, the spiced grilled meat that has become a national snack, originated with the Hausa-Fulani people of northern Nigeria. Egusi soup, made with ground melon seeds and leafy vegetables, is found across Yoruba, Igbo, and many other communities with significant regional variations in preparation. What counts as "Nigerian food" is a political question as much as a culinary one.',
      'The honest travel recommendation is this: ignore the restaurant guides and follow the smoke. In any West African city or town, the best food at any given hour is being cooked on charcoal or wood fire by someone who has been doing it for decades. Find the smoke. Sit down. Order whatever is in the pot. The argument about jollof can wait.',
    ],
  },
  {
    title: 'Stone Town, Zanzibar: Reading a City Through Its Doors',
    slug: 'zanzibar-stone-town-doors',
    publishedAt: '2025-12-20',
    excerpt: 'The carved wooden doors of Stone Town are the most photographed feature of the island. They are also a direct record of who has controlled this city over six centuries.',
    category: 'Culture & Heritage',
    tags: ['Zanzibar', 'Tanzania', 'East Africa', 'Architecture', 'History', 'Stone Town'],
    author: { name: 'Nkosi Dlamini' },
    metaTitle: 'Stone Town, Zanzibar: A Guide to the City\'s Carved Doors and History – MyAfroWaka',
    metaDescription: 'Stone Town\'s carved wooden doors document six centuries of Swahili, Arab, Indian, and British influence on Zanzibar. A guide to reading the city through its architecture.',
    content: [
      'In Stone Town, the capital of Zanzibar, the wooden doors are older than most of what surrounds them. The buildings collapse and are rebuilt. The doors are repaired and re-hung, sometimes in new doorframes, sometimes in doorframes that have been in continuous use for three hundred years. A serious door in Stone Town is not decoration. It is a record.',
      'The doors tell you, to a reasonably precise degree, who built the house and when. The oldest doors are Swahili in origin: wide, low, with squared tops and geometric carving that draws on Islamic design traditions. The doors built during the period of Omani Arab dominance in the nineteenth century are taller, with rounded tops and horizontal bands of carving containing chains, fish, and lotus flowers. The chains are not symbolic of captivity in the way a contemporary eye might assume. They were intended to represent wealth and security. The fish were for prosperity. The lotus was borrowed from Indian design and signals the substantial Indian merchant community that operated in Stone Town from the seventeenth century onward.',
      'The Omani Sultans made Zanzibar the capital of their East African commercial empire in the early nineteenth century. At its height, the island was the world\'s largest producer of cloves, and Stone Town was the commercial centre through which a very large portion of East Africa\'s trade moved, including trade in enslaved people. The Old Fort, built in the early seventeenth century by Omani Arabs on the site of a Portuguese chapel, still stands near the seafront. The Palace Museum, formerly the Sultan\'s palace, traces the history of Omani rule on the island.',
      'The slave trade was abolished formally in Zanzibar in 1873, following sustained pressure from the British government. The underground chambers of the former slave market near the Anglican Cathedral are preserved as part of the Cathedral complex. They are small and dark and hold information that a comfortable tourist can spend a morning with and not fully absorb.',
      'Walking Stone Town without a guide is possible. The street grid is genuinely confusing, which is not an accident. Streets in dense urban settlements across East Africa were designed to disorient people who did not live there. Getting lost in Stone Town is a feature, not a design failure. You will arrive, eventually, at the seafront. The sea is always to the west.',
      'The best time to walk is early morning, before the heat accumulates and before the tourist traffic builds. At six in the morning, the streets belong to the people who live there. The doors are being polished. The bread is being carried from the bakeries. The call to prayer from Forodhani has just finished. Stone Town at that hour is a working city, not a museum. That distinction is the most important thing to understand before you arrive.',
    ],
  },
]
