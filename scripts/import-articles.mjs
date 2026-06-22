/**
 * Reads all published .docx article files, splits into individual articles,
 * matches each to a Sanity attraction by name, and imports the article body
 * as Portable Text. Sets contentStatus to "Published" on success.
 */
import mammoth from 'mammoth'
import { createClient } from '@sanity/client'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = resolve(__dirname, '../../../02-Articles/published')

const client = createClient({
  projectId: 'k2ysdc2b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// ── HTML → Portable Text converter ───────────────────────────────────────────

function key() {
  return Math.random().toString(36).slice(2, 10)
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .trim()
}

function htmlToBlocks(html) {
  const blocks = []

  // Remove the Quick Overview table (first table in the article)
  // and any duplicate section-title tables (Word adds a styled table before each H2)
  let cleaned = html
  // Remove ALL tables — Quick Overview data is already in Sanity fields
  cleaned = cleaned.replace(/<table[\s\S]*?<\/table>/gi, '')

  // Now parse block-level elements
  const blockPattern = /<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi
  let match

  while ((match = blockPattern.exec(cleaned)) !== null) {
    const tag = match[1].toLowerCase()
    const inner = stripTags(match[2])
    if (!inner || inner.length < 2) continue

    let style = 'normal'
    if (tag === 'h2') style = 'h2'
    else if (tag === 'h3') style = 'h3'
    else if (tag === 'h4') style = 'h4'

    blocks.push({
      _type: 'block',
      _key: key(),
      style,
      children: [{ _type: 'span', _key: key(), text: inner }],
      markDefs: [],
    })
  }

  return blocks
}

// ── Extract attraction name from article title ────────────────────────────────

function extractAttractionName(title) {
  // "Accra Travel Guide 2026" → "Accra"
  // "Table Mountain Travel Guide 2026" → "Table Mountain"
  // "Cape Coast Castle Travel Guide 2026" → "Cape Coast Castle"
  return title
    .replace(/\s*(Travel Guide|Visitor Guide|Complete Guide|Guide)\s*\d{0,4}/gi, '')
    .replace(/\s*(–|-)\s*.*/g, '')
    .trim()
}

// ── Split HTML into individual articles ──────────────────────────────────────

function splitArticles(html) {
  // Each article starts with a table containing <strong>MYAFROWAKA</strong>
  // followed by a <strong>Title Here</strong> on the next line
  const articles = []

  // Find each occurrence of MYAFROWAKA header table
  const markerPattern = /<table[\s\S]*?MYAFROWAKA[\s\S]*?<\/table>/gi
  const positions = []
  let m

  while ((m = markerPattern.exec(html)) !== null) {
    // Extract the title — second <strong> block in the table
    const tableHtml = m[0]
    const strongMatches = [...tableHtml.matchAll(/<strong>([\s\S]*?)<\/strong>/gi)]
    // First strong = "MYAFROWAKA", second strong = article title
    const title = strongMatches[1]
      ? strongMatches[1][1].replace(/<[^>]+>/g, '').trim()
      : null
    if (!title || title.length < 5) continue
    positions.push({ index: m.index + m[0].length, title }) // start AFTER the header table
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index
    const end = i + 1 < positions.length ? positions[i + 1].index - 1 : html.length
    articles.push({
      title: positions[i].title,
      html: html.slice(start, end),
    })
  }

  return articles
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.docx'))
  console.log(`Found ${files.length} article files\n`)

  // Pre-load all attraction slugs/names from Sanity
  const allAttractions = await client.fetch(
    '*[_type == "attraction"]{_id, name, "slug": slug.current, contentStatus}'
  )
  console.log(`Loaded ${allAttractions.length} attractions from Sanity\n`)

  const results = { imported: 0, skipped: 0, notFound: [] }

  for (const file of files) {
    const filePath = resolve(ARTICLES_DIR, file)
    console.log(`\nProcessing: ${file}`)

    let htmlResult
    try {
      htmlResult = await mammoth.convertToHtml({ path: filePath })
    } catch (e) {
      console.log(`  ERROR reading file: ${e.message}`)
      continue
    }

    const articles = splitArticles(htmlResult.value)
    console.log(`  Found ${articles.length} article(s)`)

    for (const article of articles) {
      const attractionName = extractAttractionName(article.title)
      console.log(`  → "${article.title}" (looking for: "${attractionName}")`)

      // Find matching attraction — exact name match first, then partial
      let match = allAttractions.find(
        a => a.name.toLowerCase() === attractionName.toLowerCase()
      )
      if (!match) {
        match = allAttractions.find(
          a => a.name.toLowerCase().includes(attractionName.toLowerCase()) ||
               attractionName.toLowerCase().includes(a.name.toLowerCase())
        )
      }

      if (!match) {
        console.log(`    NOT FOUND in Sanity — skipping`)
        results.notFound.push(attractionName)
        results.skipped++
        continue
      }

      console.log(`    Matched: ${match.name} (${match._id})`)

      // Convert article HTML to Portable Text blocks
      // Skip the H1 (article title) and Quick Overview table — start from "What Is" section
      const blocks = htmlToBlocks(article.html)

      // Remove the first H1 block (the article title itself)
      const contentBlocks = blocks.filter((b, i) => !(i === 0 && b.style === 'h1'))

      if (contentBlocks.length === 0) {
        console.log(`    No content blocks extracted — skipping`)
        results.skipped++
        continue
      }

      // Update the Sanity document
      await client
        .patch(match._id)
        .set({
          articleBody: contentBlocks,
          contentStatus: 'Published',
        })
        .commit()

      console.log(`    Imported ${contentBlocks.length} blocks → status set to Published`)
      results.imported++
    }
  }

  console.log('\n─────────────────────────────────────')
  console.log(`Done!`)
  console.log(`  Imported: ${results.imported} articles`)
  console.log(`  Skipped:  ${results.skipped}`)
  if (results.notFound.length > 0) {
    console.log(`\nNot matched in Sanity (${results.notFound.length}):`)
    results.notFound.forEach(n => console.log(`  - ${n}`))
  }
}

main().catch(err => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
