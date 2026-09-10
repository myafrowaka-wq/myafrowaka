import { COUNTRY_COLOR } from '@/lib/regionColors'
import { stockImage } from '@/lib/stockImageCredits'

// Plain (non-"use client") data module. The homepage (a Server Component)
// shuffles these per request and passes the result into the carousel
// Client Components as props — so the data can't live inside those client
// files: a server component importing a non-component value out of a
// "use client" module gets a client-reference proxy back, not the real
// array (`items.slice is not a function`). Keeping it here fixes that.

export type HomeCountry = {
  name: string; slug: string; region: string; code: string; color: string; image: string
}

// Owner review (2026-09-10) — "I can load it again later today, and it's
// supposed to start from Nigeria." Shuffled per page load in
// app/[locale]/page.tsx. Nigeria is back: it now has a real overview and
// five published attractions, so /destinations/nigeria no longer 404s
// (the reason Session 6.3 removed it).
export const HOME_COUNTRIES: HomeCountry[] = [
  { name: 'Nigeria',      slug: 'nigeria',      region: 'West Africa',     code: 'ng', color: COUNTRY_COLOR['Nigeria'],      image: stockImage('1618828665011-0abd973f7bb8') },
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',    code: 'eg', color: COUNTRY_COLOR['Egypt'],        image: stockImage('1640005438758-861043e64aa5') },
  // Session 6.3 (WDOS Performance gate) — see lib/stockImageCredits.ts's
  // matching comment on COUNTRY_IMAGE_IDS.kenya: the old ID here was a
  // graphic lion-kill photo, not a Kenya tourism scene.
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',     code: 'ke', color: COUNTRY_COLOR['Kenya'],        image: stockImage('hero-savanna-poster') },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa', code: 'za', color: COUNTRY_COLOR['South Africa'], image: stockImage('1744604030401-b24c5975a574') },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',     code: 'tz', color: COUNTRY_COLOR['Tanzania'],     image: stockImage('1635865897833-38bc0f8aee44') },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',    code: 'ma', color: COUNTRY_COLOR['Morocco'],      image: stockImage('1760681554227-d7aad73cd57f') },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',     code: 'gh', color: COUNTRY_COLOR['Ghana'],        image: stockImage('1727023663928-1772e2c7e679') },
  { name: 'Rwanda',       slug: 'rwanda',       region: 'East Africa',     code: 'rw', color: COUNTRY_COLOR['Rwanda'],       image: stockImage('1682773083896-95176d8aecf8') },
  { name: 'Ethiopia',     slug: 'ethiopia',     region: 'East Africa',     code: 'et', color: COUNTRY_COLOR['Ethiopia'],     image: stockImage('1782283849015-df78517d4765') },
  { name: 'Uganda',       slug: 'uganda',       region: 'East Africa',     code: 'ug', color: COUNTRY_COLOR['Uganda'],       image: stockImage('1614528767034-70de9fe166e0') },
  { name: 'Senegal',      slug: 'senegal',      region: 'West Africa',     code: 'sn', color: COUNTRY_COLOR['Senegal'],      image: stockImage('1644772088209-c71d5c59f719') },
  { name: 'Zimbabwe',     slug: 'zimbabwe',     region: 'Southern Africa', code: 'zw', color: COUNTRY_COLOR['Zimbabwe'],     image: stockImage('1618811308896-d279d72fdf4d') },
  { name: 'Namibia',      slug: 'namibia',      region: 'Southern Africa', code: 'na', color: COUNTRY_COLOR['Namibia'],      image: stockImage('1563985336376-568060942b80') },
  { name: 'Botswana',     slug: 'botswana',     region: 'Southern Africa', code: 'bw', color: COUNTRY_COLOR['Botswana'],     image: stockImage('1531208853003-c1ec1b8a81d7') },
]

// Owner review (2026-09-06) — widened from 6 to 10 (each image is already
// a vetted photo used elsewhere for the same subject, not a fresh one).
// Owner review (2026-09-10) — "randomize so it doesn't start with safari,
// culture, beach." Shuffled per page load in app/[locale]/page.tsx.
export const HOME_EXPERIENCES = [
  { label: 'Safari',    slug: 'safari',    desc: 'The Big Five and beyond',                image: stockImage('1741850820849-1b63a5911606') },
  { label: 'Culture',   slug: 'culture',   desc: 'Living traditions across the continent', image: stockImage('1597212618440-806262de4f6b') },
  { label: 'Beach',     slug: 'beach',     desc: 'Indian Ocean and Atlantic shores',       image: stockImage('1577455486223-089171b4572f') },
  { label: 'History',   slug: 'history',   desc: 'Ancient kingdoms and World Heritage',    image: stockImage('1640005438758-861043e64aa5') },
  { label: 'Hiking',    slug: 'hiking',    desc: 'Trails from Simien to Table Mountain',   image: stockImage('1563985336376-568060942b80') },
  { label: 'Food',      slug: 'food',      desc: 'Tagines, jollof, nyama choma',           image: stockImage('1664992960082-0ea299a9c53e') },
  { label: 'Wildlife',  slug: 'wildlife',  desc: 'National parks and migration corridors', image: stockImage('1635865897833-38bc0f8aee44') },
  { label: 'Desert',    slug: 'desert',    desc: 'Dunes, salt pans, and starlit nights',   image: stockImage('1666837147745-1c9dea9908a4') },
  { label: 'Islands',   slug: 'islands',   desc: 'Archipelagos across the Indian Ocean',   image: stockImage('1513415277900-a62401e19be4') },
  { label: 'Markets',   slug: 'markets',   desc: 'Open-air trade, centuries in the making', image: stockImage('1776153380872-108ba14dc63d') },
]
