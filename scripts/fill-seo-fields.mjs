/**
 * Auto-fills SEO fields for all Published attractions that are missing them:
 * - editorialSummary: first 2 sentences from "What Is" section of article body
 * - focusKeyword: "[Attraction Name]" (2-4 word version)
 * - metaTitle: "[Attraction Name] Travel Guide – [Country] | MyAfroWaka"
 * - metaDescription: editorial summary trimmed to 155 chars
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'k2ysdc2b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const attractions = await client.fetch(`
  *[_type == "attraction" && contentStatus == "Published"]{
    _id, name, articleBody,
    focusKeyword, metaTitle, metaDescription, editorialSummary,
    "countryName": country->name
  }
`)

console.log(`Processing ${attractions.length} published attractions...\n`)

function extractEditorialSummary(articleBody) {
  if (!articleBody || articleBody.length === 0) return null
  // Find the block after the "What Is" heading — that's the first real paragraph
  let foundWhatIs = false
  for (const block of articleBody) {
    const text = (block.children || []).map(c => c.text || '').join('').trim()
    if (!text) continue
    if (text.toLowerCase().startsWith('what is')) {
      foundWhatIs = true
      continue
    }
    if (foundWhatIs && block.style === 'normal' && text.length > 50) {
      // Take first 2 sentences
      const sentences = text.match(/[^.!?]+[.!?]+/g) || []
      return sentences.slice(0, 2).join(' ').trim() || text.slice(0, 250)
    }
  }
  // Fallback: first normal block with substance
  for (const block of articleBody) {
    if (block.style !== 'normal') continue
    const text = (block.children || []).map(c => c.text || '').join('').trim()
    if (text.length > 80) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || []
      return sentences.slice(0, 2).join(' ').trim()
    }
  }
  return null
}

function buildFocusKeyword(name) {
  const words = name.split(/\s+/)
  // Keep up to 4 words max
  return words.slice(0, 4).join(' ')
}

function buildMetaTitle(name, country) {
  const base = `${name} Travel Guide`
  const full = country ? `${base} – ${country}` : base
  return full.length <= 60 ? full : full.slice(0, 57) + '...'
}

function buildMetaDescription(summary, name, country) {
  if (summary && summary.length >= 100) {
    return summary.length <= 155 ? summary : summary.slice(0, 152) + '...'
  }
  const fallback = `Plan your visit to ${name}${country ? `, ${country}` : ''}. Discover the best things to see and do, entry fees, best time to visit, and practical travel tips from MyAfroWaka.`
  return fallback.length <= 155 ? fallback : fallback.slice(0, 152) + '...'
}

let updated = 0

for (const a of attractions) {
  const patch = {}

  if (!a.editorialSummary) {
    const summary = extractEditorialSummary(a.articleBody)
    if (summary) patch.editorialSummary = summary
  }

  if (!a.focusKeyword) {
    patch.focusKeyword = buildFocusKeyword(a.name)
  }

  if (!a.metaTitle) {
    patch.metaTitle = buildMetaTitle(a.name, a.countryName)
  }

  if (!a.metaDescription) {
    const summary = patch.editorialSummary || a.editorialSummary || ''
    patch.metaDescription = buildMetaDescription(summary, a.name, a.countryName)
  }

  if (Object.keys(patch).length > 0) {
    await client.patch(a._id).set(patch).commit()
    console.log(`✅ ${a.name} — updated: ${Object.keys(patch).join(', ')}`)
    updated++
  } else {
    console.log(`✓  ${a.name} — already complete`)
  }
}

console.log(`\nDone. Updated ${updated} attractions.`)
