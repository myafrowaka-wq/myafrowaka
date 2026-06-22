import mammoth from 'mammoth'
import { createClient } from '@sanity/client'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const client = createClient({
  projectId: 'k2ysdc2b', dataset: 'production', apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false,
})

const file = resolve(__dirname, '../../../02-Articles/in-progress/Table_Mountain_Travel_Guide_2026.docx')
const { value: html } = await mammoth.convertToHtml({ path: file })

function key() { return Math.random().toString(36).slice(2, 10) }
function stripTags(h) {
  return h.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').trim()
}

// Remove tables, parse block elements
const cleaned = html.replace(/<table[\s\S]*?<\/table>/gi, '')
const blocks = []
const blockPattern = /<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi
let m
while ((m = blockPattern.exec(cleaned)) !== null) {
  const tag = m[1].toLowerCase()
  const inner = stripTags(m[2])
  if (!inner || inner.length < 2) continue
  let style = 'normal'
  if (tag === 'h2') style = 'h2'
  else if (tag === 'h3') style = 'h3'
  blocks.push({ _type: 'block', _key: key(), style, children: [{ _type: 'span', _key: key(), text: inner }], markDefs: [] })
}

console.log(`Extracted ${blocks.length} blocks from Table Mountain article`)

await client.patch('attraction-ATT-0300')
  .set({ articleBody: blocks, contentStatus: 'Published' })
  .commit()

console.log('Table Mountain article imported and set to Published.')
