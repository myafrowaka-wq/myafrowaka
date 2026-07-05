export interface Author {
  name: string
  slug: string
  country: string
  countryFlag: string
  bio: string
  fullBio: string
  avatarId: string
  expertise: string[]
}

export const AUTHORS: Author[] = [
  {
    name: 'Amara Diallo',
    slug: 'amara-diallo',
    country: 'Ghana',
    countryFlag: '\u{1F1EC}\u{1F1ED}',
    bio: 'Amara writes about West African cities, coastal communities, and the living traditions that shape how people move through the continent.',
    fullBio: 'Amara Diallo is a travel writer and cultural correspondent based in Accra, Ghana. She covers West African cities, coastal communities, and the living traditions that shape how people move through the continent. Her writing looks for what is overlooked in conventional travel coverage: the market stall operators, the minor roads, the neighbourhoods that tourists do not reach. Her work has taken her from Lagos to Dakar to Lomé, always with a focus on the human geography beneath the surface.',
    avatarId: '1573497019418-b400bb3ab074',
    expertise: ['West Africa', 'Urban Africa', 'Culture', 'Markets'],
  },
  {
    name: 'Nkosi Dlamini',
    slug: 'nkosi-dlamini',
    country: 'South Africa',
    countryFlag: '\u{1F1FF}\u{1F1E6}',
    bio: 'Nkosi covers Southern and East African landscapes, national parks, and the conservation stories behind them.',
    fullBio: 'Nkosi Dlamini is a Johannesburg-based writer who has spent the better part of a decade travelling the parks, deserts, and coastlines of Southern and East Africa. He writes about wildlife, landscape, and the political and economic forces that determine how these environments are protected or lost. Nkosi has visited every national park in South Africa and has trekked in the Drakensberg, Namib, and Virunga ranges.',
    avatarId: '1518882570151-157128e78fa1',
    expertise: ['Southern Africa', 'East Africa', 'Wildlife', 'National Parks', 'Conservation'],
  },
  {
    name: 'Chioma Adeyemi',
    slug: 'chioma-adeyemi',
    country: 'Nigeria',
    countryFlag: '\u{1F1F3}\u{1F1EC}',
    bio: 'Chioma covers East African wildlife and conservation, and has reported from parks across Kenya, Tanzania, and Uganda.',
    fullBio: 'Chioma Adeyemi grew up in Lagos and has spent the last six years documenting East African wildlife ecosystems. She has been embedded with conservation teams in Maasai Mara, Serengeti, and Bwindi, and her work holds both the grandeur of these landscapes and the difficult realities of living near them. She is a regular contributor on safari planning, conservation science, and the economics of wildlife tourism.',
    avatarId: '1593351799227-75df2026356b',
    expertise: ['East Africa', 'Wildlife', 'Conservation', 'Safari'],
  },
  {
    name: 'Kwame Boateng',
    slug: 'kwame-boateng',
    country: 'Ghana',
    countryFlag: '\u{1F1EC}\u{1F1ED}',
    bio: 'Kwame specialises in adventure travel and trekking routes across the continent.',
    fullBio: 'Kwame Boateng is an adventure travel writer and trail guide from Kumasi, Ghana. He has completed the Kilimanjaro, Simien Mountains, and Rwenzori treks, and regularly leads small expeditions through West African forest regions. His guides focus on practical preparation, accurate difficulty ratings, and the communities that trail routes pass through. He believes the best hiking writing is the kind that gets people off the page and onto the path.',
    avatarId: '1518882570151-157128e78fa1',
    expertise: ['Adventure', 'Hiking', 'Trekking', 'Mountains'],
  },
  {
    name: 'Fatou Diallo',
    slug: 'fatou-diallo',
    country: 'Senegal',
    countryFlag: '\u{1F1F8}\u{1F1F3}',
    bio: 'Fatou explores the intersections of food, tradition, and place across Francophone Africa.',
    fullBio: 'Fatou Diallo is a food and culture writer from Dakar, Senegal. She writes about the way food anchors identity across Francophone Africa, from Senegalese thiéboudienne to Cameroonian ndolé to Congolese pondu. Her work visits markets, home kitchens, and restaurants with equal interest, and she is particularly concerned with how African cuisines are documented, exported, and occasionally misrepresented abroad.',
    avatarId: '1713845784497-fe3d7ed176d8',
    expertise: ['Food Tourism', 'Francophone Africa', 'Culture', 'Senegal'],
  },
  {
    name: 'Nadia Mensah',
    slug: 'nadia-mensah',
    country: 'Ghana',
    countryFlag: '\u{1F1EC}\u{1F1ED}',
    bio: 'Nadia focuses on independent travel in North Africa and has visited every country on the continent.',
    fullBio: 'Nadia Mensah is an independent travel writer from Accra who has visited every country on the African continent. She specialises in North Africa, particularly Morocco, Tunisia, and Egypt, and her guides focus on solo and independent travel: how to move without a tour, where to stay with locals, how to navigate medinas and souks. Her approach is practical and her writing is shaped by the belief that Africa is the most underrated destination on earth.',
    avatarId: '1654420571616-25ae4e3a83a5',
    expertise: ['North Africa', 'Independent Travel', 'Morocco', 'Egypt', 'Tunisia'],
  },
  {
    name: 'MyAfroWaka Editorial Team',
    slug: 'editorial-team',
    country: 'Africa',
    countryFlag: '\u{1F30D}',
    bio: 'The MyAfroWaka editorial team researches, fact-checks, and publishes guides to the most remarkable places across Africa.',
    fullBio: 'The MyAfroWaka editorial team is a distributed group of writers, researchers, and local experts across the continent. All editorial content is verified against primary sources before publication. Content attributed to the editorial team has been reviewed and approved by at least two members of the editorial board.',
    avatarId: '1518882570151-157128e78fa1',
    expertise: ['Africa', 'Research', 'Travel', 'Editorial'],
  },
]

export function getAuthorByName(name: string): Author | undefined {
  return AUTHORS.find(a => a.name === name)
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return AUTHORS.find(a => a.slug === slug)
}

export function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
