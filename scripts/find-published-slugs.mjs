import { createClient } from '@sanity/client'
const client = createClient({ projectId: 'k2ysdc2b', dataset: 'production', apiVersion: '2024-01-01', useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN })

const results = await client.fetch(
  '*[_type == "attraction" && contentStatus == "Published"]{name,"slug":slug.current} | order(name asc)'
)
console.log(`Total published: ${results.length}\n`)
results.forEach(r => console.log(`${r.name}\n  /attractions/${r.slug}\n`))
