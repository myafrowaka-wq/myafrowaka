// Session 2.3 — move the 11 hardcoded blog posts and the (real, per the
// owner's confirmation) author profiles into Sanity as real records.
//
// Author photos are deliberately left unset. WDOS X-30 (no fabricated
// attribution, no override) means a stock or placeholder image attached to a
// named real person is exactly the violation this gate exists to stop — the
// old lib/authors.ts even reused the SAME Unsplash photo for two different
// named authors, which is what caught this in the first place. Photos get
// added in Sanity Studio once the owner has real ones; the frontend falls
// back to an initials avatar until then, not a fake photo.
//
// Bios are deliberately minimal for the same reason. The owner confirmed the
// 6 original named writers are real people, but never verified the specific
// narrative claims the old placeholder file made about them ("grew up in
// Lagos", "completed the Kilimanjaro, Simien Mountains, and Rwenzori treks",
// "visited every country on the continent") — those were unconfirmed when
// this script first ran and got migrated in anyway, which was a mistake:
// carrying unverified personal-history claims about a real named person into
// what the site now presents as their official record is its own X-30
// problem, arguably worse than the placeholder file since it now reads as
// authoritative. Rewritten here to state only what's actually demonstrable —
// the person's name, role, country, and (where they have real published
// articles) the topics those articles actually cover — until the owner sends
// verified bios to replace these with.
//
// Re-run with: npx tsx scripts/seed-blog-and-authors.js
// (uses createOrReplace, safe to run again after edits to this file)

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('next-sanity')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const AUTHORS = [
  {
    _id: 'author-martina-umeh',
    name: 'Martina Umeh',
    slug: 'martina-umeh',
    country: 'Nigeria',
    role: 'Senior Editor & Content Strategist',
    bio: 'Martina Umeh is the senior editor and content strategist for MyAfroWaka, based in Abuja, Nigeria.',
    specialism: [],
  },
  {
    _id: 'author-amara-diallo',
    name: 'Amara Diallo',
    slug: 'amara-diallo',
    country: 'Ghana',
    role: 'Contributing Writer',
    // Derived from what she has actually published on the site (city guides
    // across Ethiopia, South Africa, Ghana, Nigeria, Morocco, and West
    // African food culture), not from an unverified personal-history claim.
    bio: 'Amara Diallo is a contributing writer for MyAfroWaka. Her published work covers African cities and food culture, including guides to Addis Ababa, Cape Town, Kumasi, Lagos, and Marrakech.',
    specialism: ['Destinations', 'Culture & Heritage', 'Food Tourism'],
  },
  {
    _id: 'author-nkosi-dlamini',
    name: 'Nkosi Dlamini',
    slug: 'nkosi-dlamini',
    country: 'South Africa',
    role: 'Contributing Writer',
    // Same basis: derived from real published articles (Kenya, Namibia,
    // Rwanda, Zimbabwe, Tanzania), not an invented travel history.
    bio: 'Nkosi Dlamini is a contributing writer for MyAfroWaka. His published work covers wildlife, landscape, and travel planning across Southern and East Africa, including the Maasai Mara, the Namib Desert, Rwanda, Victoria Falls, and Zanzibar.',
    specialism: ['Experiences', 'Travel Planning', 'Culture & Heritage'],
  },
  {
    _id: 'author-chioma-adeyemi',
    name: 'Chioma Adeyemi',
    slug: 'chioma-adeyemi',
    country: 'Nigeria',
    role: 'Contributing Writer',
    bio: 'Chioma Adeyemi is a contributing writer for MyAfroWaka.',
    specialism: [],
  },
  {
    _id: 'author-kwame-boateng',
    name: 'Kwame Boateng',
    slug: 'kwame-boateng',
    country: 'Ghana',
    role: 'Contributing Writer',
    bio: 'Kwame Boateng is a contributing writer for MyAfroWaka.',
    specialism: [],
  },
  {
    _id: 'author-fatou-diallo',
    name: 'Fatou Diallo',
    slug: 'fatou-diallo',
    country: 'Senegal',
    role: 'Contributing Writer',
    bio: 'Fatou Diallo is a contributing writer for MyAfroWaka.',
    specialism: [],
  },
  {
    _id: 'author-nadia-mensah',
    name: 'Nadia Mensah',
    slug: 'nadia-mensah',
    country: 'Ghana',
    role: 'Contributing Writer',
    bio: 'Nadia Mensah is a contributing writer for MyAfroWaka.',
    specialism: [],
  },
  {
    _id: 'author-editorial-team',
    name: 'MyAfroWaka Editorial Team',
    slug: 'editorial-team',
    country: 'Africa',
    role: 'Editorial Team',
    bio: 'The MyAfroWaka editorial team is a distributed group of writers, researchers, and local experts across the continent. All editorial content is verified against primary sources before publication.',
    specialism: ['Africa', 'Research', 'Travel', 'Editorial'],
  },
]

const POSTS = [
  { id: 'post-lagos-rush-hour-city-life', slug: 'lagos-rush-hour-city-life', authorId: 'author-amara-diallo' },
  { id: 'post-kumasi-central-market-west-africa', slug: 'kumasi-central-market-west-africa', authorId: 'author-amara-diallo' },
  { id: 'post-slow-travel-rwanda', slug: 'slow-travel-rwanda', authorId: 'author-nkosi-dlamini' },
  { id: 'post-namib-desert-first-light', slug: 'namib-desert-first-light', authorId: 'author-nkosi-dlamini' },
  { id: 'post-west-africa-food-culture', slug: 'west-africa-food-culture', authorId: 'author-amara-diallo' },
  { id: 'post-zanzibar-stone-town-doors', slug: 'zanzibar-stone-town-doors', authorId: 'author-nkosi-dlamini' },
  { id: 'post-marrakech-djemaa-el-fna-guide', slug: 'marrakech-djemaa-el-fna-guide', authorId: 'author-amara-diallo' },
  { id: 'post-victoria-falls-zimbabwe-guide', slug: 'victoria-falls-zimbabwe-guide', authorId: 'author-nkosi-dlamini' },
  { id: 'post-maasai-mara-wildebeest-migration-kenya', slug: 'maasai-mara-wildebeest-migration-kenya', authorId: 'author-nkosi-dlamini' },
  { id: 'post-cape-town-winter-travel-guide', slug: 'cape-town-winter-travel-guide', authorId: 'author-amara-diallo' },
  { id: 'post-addis-ababa-walking-guide', slug: 'addis-ababa-walking-guide', authorId: 'author-amara-diallo' },
]

// Converts the plain-paragraph fallback content into Sanity Portable Text
// blocks. A fresh random-ish key per block/span (Sanity requires unique
// _key values within an array, doesn't require cryptographic randomness).
let keyCounter = 0
function nextKey() {
  keyCounter += 1
  return `k${Date.now().toString(36)}${keyCounter}`
}

function paragraphsToPortableText(paragraphs) {
  return paragraphs.map(text => ({
    _type: 'block',
    _key: nextKey(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: nextKey(), text, marks: [] }],
  }))
}

async function main() {
  // Pull the full fallback data straight from the source file so this script
  // never carries a second, divergent copy of the article content. Run via
  // `npx tsx` (not plain node) so this TS import resolves.
  const { FALLBACK_POSTS } = require('../lib/fallbackPosts.ts')

  console.log(`Writing ${AUTHORS.length} author documents...`)
  let tx = client.transaction()
  for (const a of AUTHORS) {
    tx = tx.createOrReplace({
      _id: a._id,
      _type: 'author',
      name: a.name,
      slug: { _type: 'slug', current: a.slug },
      country: a.country,
      role: a.role,
      bio: a.bio,
      specialism: a.specialism,
      // photo intentionally omitted — see file header.
    })
  }
  await tx.commit()
  console.log('Authors written.')

  console.log(`\nWriting ${POSTS.length} post documents...`)
  let tx2 = client.transaction()
  for (const p of POSTS) {
    const fp = FALLBACK_POSTS.find(x => x.slug === p.slug)
    if (!fp) { console.error(`ERROR: no fallback content found for slug ${p.slug}`); process.exit(1) }
    tx2 = tx2.createOrReplace({
      _id: p.id,
      _type: 'post',
      title: fp.title,
      slug: { _type: 'slug', current: fp.slug },
      publishedAt: new Date(fp.publishedAt).toISOString(),
      contentStatus: 'Published',
      excerpt: fp.excerpt,
      category: fp.category,
      tags: fp.tags,
      author: { _type: 'reference', _ref: p.authorId },
      body: paragraphsToPortableText(fp.content),
      metaTitle: fp.metaTitle,
      metaDescription: fp.metaDescription,
      // coverImage intentionally omitted — Session 2.4's real image pipeline
      // job. The blog pages' own slug-keyed Unsplash lookup keeps serving
      // images in the meantime, independent of this field.
    })
  }
  const result = await tx2.commit()
  console.log('Posts written. Transaction result:', result.transactionId)
}

main().catch(e => {
  console.error('FAILED:', e)
  process.exit(1)
})
