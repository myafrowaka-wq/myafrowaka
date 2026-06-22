/**
 * Phase 8 SEO checklist — runs on all Published attractions in Sanity.
 * Checks: em-dashes, focus keyword placement, meta title/description length.
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
    name, "slug": slug.current,
    focusKeyword, metaTitle, metaDescription, editorialSummary,
    articleBody
  }
`)

console.log(`Checking ${attractions.length} published attractions...\n`)

const issues = []

for (const a of attractions) {
  const pageIssues = []

  // Extract plain text from articleBody blocks
  const bodyText = (a.articleBody || [])
    .map(block => (block.children || []).map(c => c.text || '').join(' '))
    .join('\n')

  // 1. Em-dash check (—)
  if (bodyText.includes('—') || (a.editorialSummary || '').includes('—') ||
      (a.metaTitle || '').includes('—') || (a.metaDescription || '').includes('—')) {
    pageIssues.push('❌ Em-dash found')
  }

  // 2. Focus keyword checks
  if (!a.focusKeyword) {
    pageIssues.push('⚠️  No focus keyword set')
  } else {
    const kw = a.focusKeyword.toLowerCase()
    const first100 = bodyText.slice(0, 500).toLowerCase()

    if (!(a.metaTitle || '').toLowerCase().includes(kw)) {
      pageIssues.push(`⚠️  Focus keyword "${a.focusKeyword}" missing from Meta Title`)
    }
    if (!(a.metaDescription || '').toLowerCase().includes(kw)) {
      pageIssues.push(`⚠️  Focus keyword "${a.focusKeyword}" missing from Meta Description`)
    }
    if (bodyText && !first100.includes(kw)) {
      pageIssues.push(`⚠️  Focus keyword "${a.focusKeyword}" not in first 500 chars of article`)
    }
  }

  // 3. Meta title length
  if (!a.metaTitle) {
    pageIssues.push('⚠️  No Meta Title set')
  } else if (a.metaTitle.length > 65) {
    pageIssues.push(`⚠️  Meta Title too long: ${a.metaTitle.length} chars (max 65)`)
  }

  // 4. Meta description length
  if (!a.metaDescription) {
    pageIssues.push('⚠️  No Meta Description set')
  } else if (a.metaDescription.length > 160) {
    pageIssues.push(`⚠️  Meta Description too long: ${a.metaDescription.length} chars (max 160)`)
  }

  // 5. Editorial summary present
  if (!a.editorialSummary) {
    pageIssues.push('⚠️  No Editorial Summary set')
  }

  // 6. Article body present
  if (!a.articleBody || a.articleBody.length === 0) {
    pageIssues.push('❌ No article body content')
  }

  if (pageIssues.length > 0) {
    issues.push({ name: a.name, slug: a.slug, issues: pageIssues })
  }
}

// ── Summary ────────────────────────────────────────────────────────────────────
const clean = attractions.length - issues.length
console.log(`✅ Clean:  ${clean}/${attractions.length}`)
console.log(`⚠️  Issues: ${issues.length}/${attractions.length}\n`)

if (issues.length > 0) {
  // Group: show attractions with critical issues first
  const critical = issues.filter(i => i.issues.some(x => x.startsWith('❌')))
  const warnings = issues.filter(i => i.issues.every(x => x.startsWith('⚠️')))

  if (critical.length > 0) {
    console.log('── CRITICAL (needs fixing before launch) ──')
    for (const i of critical) {
      console.log(`\n${i.name} (/attractions/${i.slug})`)
      i.issues.forEach(x => console.log(`  ${x}`))
    }
  }

  if (warnings.length > 0) {
    console.log('\n── WARNINGS (SEO fields missing — fill in Studio) ──')
    for (const i of warnings) {
      console.log(`\n${i.name}`)
      i.issues.forEach(x => console.log(`  ${x}`))
    }
  }
}
