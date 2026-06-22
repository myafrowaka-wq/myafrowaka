import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'k2ysdc2b', dataset: 'production', apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false,
})

// 1. Fix Table Mountain — remove em-dashes from article body and add editorial summary
const tm = await client.fetch(
  '*[_type == "attraction" && name == "Table Mountain"][0]{_id, articleBody, metaDescription}'
)

if (tm) {
  // Remove em-dashes from all block text
  const cleanedBody = (tm.articleBody || []).map(block => ({
    ...block,
    children: (block.children || []).map(span => ({
      ...span,
      text: (span.text || '').replace(/—/g, ',').replace(/–/g, ','),
    })),
  }))

  // Extract editorial summary from first real paragraph
  let editorialSummary = ''
  let foundWhatIs = false
  for (const block of cleanedBody) {
    const text = (block.children || []).map(c => c.text || '').join('').trim()
    if (!text) continue
    if (text.toLowerCase().startsWith('what is')) { foundWhatIs = true; continue }
    if (foundWhatIs && block.style === 'normal' && text.length > 50) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || []
      editorialSummary = sentences.slice(0, 2).join(' ').trim()
      break
    }
  }

  await client.patch(tm._id).set({
    articleBody: cleanedBody,
    ...(editorialSummary ? { editorialSummary } : {}),
  }).commit()

  console.log(`✅ Table Mountain — em-dashes removed, editorial summary set`)
  if (editorialSummary) console.log(`   Summary: "${editorialSummary.slice(0, 80)}..."`)
}

// 2. Fix meta descriptions that don't contain the focus keyword
const needsFix = await client.fetch(`
  *[_type == "attraction" && contentStatus == "Published" && defined(focusKeyword) && defined(metaDescription)]{
    _id, name, focusKeyword, metaDescription, editorialSummary
  }
`)

let fixed = 0
for (const a of needsFix) {
  const kw = a.focusKeyword.toLowerCase()
  if (!(a.metaDescription || '').toLowerCase().includes(kw)) {
    // Rebuild meta description to include the focus keyword
    const summary = a.editorialSummary || ''
    let newDesc = `${a.name}: ${summary}`.slice(0, 155)
    if (newDesc.length < 100) {
      newDesc = `Discover ${a.name}. ${summary}`.slice(0, 155)
    }
    await client.patch(a._id).set({ metaDescription: newDesc }).commit()
    fixed++
    console.log(`✅ ${a.name} — meta description updated`)
  }
}

console.log(`\nFixed ${fixed} meta descriptions.`)
