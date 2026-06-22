import { createClient } from '@sanity/client'
const client = createClient({ projectId: 'k2ysdc2b', dataset: 'production', apiVersion: '2024-01-01', useCdn: false })
const results = await client.fetch('*[_type == "attraction" && name match "Table*"]{name,"slug":slug.current,contentStatus}')
console.log(JSON.stringify(results, null, 2))
