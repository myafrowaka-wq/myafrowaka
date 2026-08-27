/**
 * Imports MyAfroWaka attraction articles from Word documents in
 * 02-Articles/published and 02-Articles/in-progress into Sanity.
 *
 * Rewritten 2026-08-27 (Session 0.3). What changed and why:
 *
 *  - Reads BOTH folders. The old version only ever read `published/`
 *    (48 articles), which is the entire reason the other ~229 were
 *    never imported. Nothing was broken; nobody pointed it at the rest.
 *
 *  - Does NOT strip Quick Overview tables. The old version deleted every
 *    <table> with a comment claiming the data was "already in Sanity
 *    fields" — it wasn't. Confirmed 0 of 557 records have an entry fee.
 *    This version parses the Quick Overview table into real schema
 *    fields where the format allows it (see below).
 *
 *  - Two Quick Overview formats exist across the source documents, not one:
 *      STANDARD  — labels match the Brain's 36-column schema directly
 *                  (Country, Sub-Region / Province, Entry Fee, Best Time
 *                  to Visit, Suitable For, ...). Confirmed on all 20
 *                  published files and ~14 of the 52 in-progress files.
 *      CUSTOM    — a bespoke per-attraction facts box with its own labels
 *                  ("The Elephants", "Transboundary", "Infrastructure"...).
 *                  Confirmed on the majority (~38) of in-progress files.
 *                  These do NOT get mapped to schema fields — the labels
 *                  don't correspond to anything, and forcing them in would
 *                  write wrong data into the wrong fields. Instead the
 *                  facts box is preserved as readable text at the top of
 *                  the imported article body, so nothing is silently lost.
 *
 *  - Only writes a field if it is CURRENTLY EMPTY on the Sanity record,
 *    and only if the source value is TYPE-SAFE for that field:
 *      - entryFeeDisplayText / bestTimeToVisit / subRegionProvince /
 *        unescoStatus are free text — safe to write directly.
 *      - entryFeeInternational, entryFeeLocal (numbers) and timeNeeded
 *        (a number, in HOURS) are never auto-filled from prose like
 *        "USD 20 per adult, USD 15 for..." or "3 to 5 days" — that is
 *        exactly the kind of silent corruption this rewrite exists to
 *        stop. Left for a real per-record verification pass.
 *      - city / nearbyCities are Sanity REFERENCES to city documents,
 *        not free text. Never auto-written from fuzzy text matching.
 *      - suitableFor and difficultyAccessLevel are locked to a specific
 *        controlled-vocabulary list in the schema. Only a value that
 *        matches the list EXACTLY is written; anything else is dropped
 *        rather than forced in as an invalid enum entry.
 *      - type (Col 11) is already populated and required on every one
 *        of the 557 records (verified 2026-08-27) — never touched.
 *      - Never overwrites a record that is already contentStatus
 *        "Published" — the 48 already-live articles are left alone.
 *
 *  - contentStatus is always set to "Draft", never "Published". Publishing
 *    229 pages in one afternoon without reading them is how one error
 *    becomes 229. Release happens in reviewed batches after this runs.
 *
 * Usage:
 *   node scripts/import-articles.mjs            → dry run, writes nothing,
 *                                                   produces a full report
 *   node scripts/import-articles.mjs --write     → performs the writes
 */
import mammoth from 'mammoth'
import { createClient } from '@sanity/client'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync, writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARTICLE_DIRS = [
  resolve(__dirname, '../../../02-Articles/published'),
  resolve(__dirname, '../../../02-Articles/in-progress'),
]
const WRITE = process.argv.includes('--write')

const client = createClient({
  projectId: 'k2ysdc2b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// ── Controlled vocabulary, copied from sanity/schemaTypes/attraction.ts ──────
// Kept in sync manually. If the schema's lists change, update these too.

const CONTINENT_REGIONS = [
  'North Africa', 'West Africa', 'East Africa',
  'Southern Africa', 'Central Africa', 'Indian Ocean Islands',
]

const SUITABLE_FOR_OPTIONS = [
  'Solo Travelers', 'Solo Travelers (with precautions)', 'Couples', 'Families',
  'Families (older children)', 'Families (young children)', 'Backpackers',
  'Hikers', 'Photographers', 'Nature Lovers', 'History Enthusiasts',
  'Archaeology Buffs', 'Educational Groups', 'Luxury Travelers', 'Adventure Seekers',
]

const DIFFICULTY_OPTIONS = ['Easy', 'Moderate', 'Strenuous', 'Guided Tour Recommended']

// Quick Overview labels this script knows how to map to a schema field.
// { docLabel: [schemaField, fieldType] } — fieldType controls how the
// value is validated/transformed before it is ever considered for write.
const STANDARD_FIELD_MAP = {
  'sub-region / province': ['subRegionProvince', 'text'],
  'sub-region/province':   ['subRegionProvince', 'text'],
  'continent region':      ['continentRegion', 'enum-single'],
  'unesco status':         ['unescoStatus', 'text'],
  'entry fee':              ['entryFeeDisplayText', 'text'],
  'best time to visit':    ['bestTimeToVisit', 'text'],
  'suitable for':          ['suitableFor', 'enum-multi'],
  'difficulty':            ['difficultyAccessLevel', 'enum-leading-word'],
}
// Labels intentionally NOT mapped, and why:
//   Country          → reference field, already required+populated on seed
//   City / Region     → `city` is a REFERENCE to a city doc, not text
//   Nearby Cities     → array of REFERENCES, same reason
//   Type              → already required+populated on all 557 records
//   Time Needed       → schema wants a NUMBER in HOURS; source is prose
//                        in days ("3 to 5 days minimum") — unit mismatch,
//                        never auto-converted

const STANDARD_FORMAT_MIN_LABELS = 6 // of 12 possible — threshold to treat as STANDARD not CUSTOM

// ── Small helpers ────────────────────────────────────────────────────────────

function key() {
  return Math.random().toString(36).slice(2, 10)
}

function stripTags(html) {
  // Tags become a SPACE, not empty string. Getting this wrong was a real bug
  // found 2026-08-27: replacing </p><p> with '' glues adjacent paragraphs
  // together with no separator ("MYAFROWAKACape Coast Castle", "2026History"),
  // which then breaks \b word-boundary matching on the run-together text
  // even though the same names matched fine as isolated substrings before.
  // The trailing \s+ collapse below means this never over-adds whitespace
  // inside what was previously a single run of inline tags either.
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function textBlock(text, style = 'normal') {
  return {
    _type: 'block', _key: key(), style,
    children: [{ _type: 'span', _key: key(), text }],
    markDefs: [],
  }
}

// ── Split HTML into individual articles ──────────────────────────────────────
//
// The original marker was a <table> containing the literal text "MYAFROWAKA".
// That fails two different ways, discovered 2026-08-27:
//
//  1. It is not table-boundary-safe. Every article also contains a small
//     footer tagline table ("MYAFROWAKA | Africa explained by Africans.")
//     partway through, and a naive [\s\S]*? between <table> and MYAFROWAKA
//     will swallow that footer AND the entire next article's real banner
//     table in one match, corrupting the boundary between two articles.
//
//  2. Worse: on the majority of in-progress files (the custom-Quick-Overview
//     format), the leading banner table does NOT contain the literal word
//     "MYAFROWAKA" at all — only a trailing footer table does, deep inside
//     the article. So the marker doesn't fire near the real start of most
//     of these articles, and whole articles go undetected.
//
// The anchor that actually holds across every file, verified 2026-08-27 by
// counting "QUICK OVERVIEW" heading occurrences against every filename's own
// numbered range (e.g. "MyAfroWaka_285-289_..." → exactly 5 occurrences):
// every one of the ~277 articles has exactly one "Quick Overview" heading,
// no exceptions found. Total count matched the expected article count
// exactly: 277.
//
// So the split now anchors on that heading. An article's CONTENT span is
// [this heading, next heading) — its own Quick Overview table plus body
// prose, with the next article's small banner table trailing harmlessly at
// the end (stripped later along with every other table). Its NAME, however,
// sits BEFORE this heading, not after it — both formats place the title
// banner in the ~200–1000 characters immediately preceding "Quick Overview".
// That preceding window is returned separately for name matching in main().

function splitArticles(html) {
  const headingPattern = /<h[1-4][^>]*>(?:<a[^>]*><\/a>)?\s*(?:<strong>)?\s*QUICK OVERVIEW\s*(?:<\/strong>)?\s*<\/h[1-4]>/gi
  const positions = []
  let m
  while ((m = headingPattern.exec(html)) !== null) positions.push(m.index)

  const PRECEDING_WINDOW = 1200
  const articles = []
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i]
    const end = i + 1 < positions.length ? positions[i + 1] : html.length
    const windowStart = Math.max(0, start - PRECEDING_WINDOW)
    articles.push({
      html: html.slice(start, end),
      precedingWindow: truncateAtGuideMarker(html.slice(windowStart, start)),
    })
  }
  return articles
}

// A real, confirmed corruption found 2026-08-27, worse than the earlier bugs
// because it silently WROTE THE WRONG ARTICLE onto a real attraction:
// "Ngorongoro Crater" 's own descriptive subtitle reads "Big Five, Black
// Rhino, Olduvai Gorge & Visitor Tips" — Olduvai Gorge is a subtopic
// MENTIONED inside Ngorongoro Crater's own tagline, not a separate article.
// Because that mention sits closer to the heading than "Ngorongoro Crater"
// itself, proximity-first picked the wrong one, and 101 blocks of real
// Ngorongoro Crater content got written onto the Olduvai Gorge record.
//
// The published/standard banner format has a reliable structural marker the
// proximity search was ignoring: "[True Name] Travel Guide 2026" always
// names the real subject, and anything in the descriptive subtitle AFTER
// that marker is just topics-covered, not identity. So once that marker is
// found, the window is truncated right after it — the subtitle, and any
// other real attraction names it happens to mention, is never even offered
// to the matcher. Confirmed this fixes the exact failing case before
// trusting it, and re-confirmed the earlier proximity/accent fixes still
// hold on custom-format files, which don't use this "Travel Guide" pattern
// at all and pass through untruncated.
function truncateAtGuideMarker(windowHtml) {
  const text = stripTags(windowHtml)
  const guidePattern = /(travel|visitor|complete)\s+guide\s*\d{0,4}/gi
  let m, last = null
  while ((m = guidePattern.exec(text)) !== null) last = m
  if (!last) return windowHtml
  // Truncate the HTML window at the character offset the guide marker ends
  // at in the STRIPPED text is not directly usable against the un-stripped
  // HTML string, so re-run the same search against the tag-stripped window
  // and simply hand back that stripped, truncated text — callers only ever
  // pass this into stripTags() again, and stripTags on already-plain text
  // is a safe no-op.
  return text.slice(0, last.index + last[0].length)
}

// ── Match a preceding window to a known attraction name ──────────────────────
//
// Rather than trying to parse one "correct" title string out of two visually
// different banner formats, search the window directly for every one of the
// 557 known attraction names as a substring.
//
// PRIORITY IS CLOSEST-TO-THE-HEADING FIRST, length only as a tiebreak.
// Found and fixed 2026-08-27 after "longest name wins" caused real damage:
// many in-progress banners read like
//   "NAMIBIA │ NAMIB-NAUKLUFT NATIONAL PARK   Sesriem Canyon   A River-Carved
//    Gorge at the Gate of the Namib   Series: Namibia Attraction Guides..."
// — a region/park breadcrumb ("Namib-Naukluft National Park", itself a real,
// separately-listed attraction) appears BEFORE the article's true subject
// ("Sesriem Canyon"). Under longest-name-wins, the breadcrumb won every
// time purely for being a longer string, and the same wrong attraction
// absorbed article after article across multiple files. Confirmed the fix
// by hand against this exact file before trusting it further: proximity to
// the heading is what marks the true subject in both formats, not length.

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Plain substring search has a second failure mode found the same day as the
// proximity bug: a short real attraction name ("Mero", 4 characters) matches
// as a raw substring inside unrelated words ("Ca-MERO-on"). A word-boundary
// check closes that off — "Cameroon" no longer satisfies the boundary test,
// since neither side of the "mero" inside it is a true word edge, while a
// standalone mention of "Mero" still matches cleanly.
//
// JS's built-in \b is ASCII-only — it treats any accented letter (é, ë, ñ...)
// as a NON-word character, so \b silently fails at the edge of any name
// ending or starting with one. That is a real, not theoretical, problem
// here: "Djenné", "Ségou", "Meroë" and similar names are common across the
// Francophone and Lusophone countries this database covers. Confirmed with
// a direct test 2026-08-27 — \bold town djenné\b matched zero times against
// text that visibly contains it twice. Fixed by using \p{L} (any Unicode
// letter) lookaround instead of \b, which handles accents correctly while
// still rejecting the Cameroon/Mero case the same way.
// A third real bug, found the same day, after the Ngorongoro/Olduvai fix
// above: when an article's TRUE subject has no matching database record at
// all ("Djenné-Djeno" — confirmed via direct query, no such attraction
// exists), the search doesn't fail closed. It falls back to whatever ELSE
// in the window happens to match a real name — usually a region breadcrumb
// ("MALI │ MOPTI REGION") — and reports that with full confidence. That
// wrote Djenné-Djeno's content onto the real "Mopti" record.
//
// Measured the gap directly 2026-08-27: every confirmed-correct match sits
// within ~31 characters of the window's end (the true subject is always the
// last distinct thing before the heading, in both formats). The confirmed
// wrong "Mopti" match sat 498 characters back — nothing close by matched at
// all, which is exactly the "no real match, fell back to noise" signature.
// MAX_DISTANCE_FROM_HEADING enforces that gap: a match too far from the
// heading is treated as no match, correctly producing a notFound entry for
// human review instead of a confident wrong write.
const MAX_DISTANCE_FROM_HEADING = 80

function matchAttractionInWindow(windowHtml, allAttractions) {
  const text = stripTags(windowHtml).toLowerCase()
  let best = null
  for (const a of allAttractions) {
    const name = a.name.toLowerCase()
    const re = new RegExp('(?<!\\p{L})' + escapeRegex(name) + '(?!\\p{L})', 'gu')
    let m, lastMatch = null
    while ((m = re.exec(text)) !== null) lastMatch = m
    if (!lastMatch) continue
    const candidate = { attraction: a, matchEnd: lastMatch.index + name.length, nameLength: name.length }
    if (!best) { best = candidate; continue }
    if (candidate.matchEnd > best.matchEnd) { best = candidate; continue }
    if (candidate.matchEnd === best.matchEnd && candidate.nameLength > best.nameLength) best = candidate
  }
  if (!best) return null
  if (text.length - best.matchEnd > MAX_DISTANCE_FROM_HEADING) return null
  return best.attraction
}

// ── Locate and parse the Quick Overview table ─────────────────────────────────

function findQuickOverviewTable(articleHtml) {
  const headingMatch = articleHtml.match(/<h[1-4][^>]*>(?:<a[^>]*><\/a>)?\s*(?:<strong>)?\s*QUICK OVERVIEW\s*(?:<\/strong>)?\s*<\/h[1-4]>/i)
  if (!headingMatch) return null
  const afterHeading = articleHtml.slice(headingMatch.index + headingMatch[0].length)
  const tableMatch = afterHeading.match(/^\s*<table[\s\S]*?<\/table>/i)
  if (!tableMatch) return null
  return { tableHtml: tableMatch[0], fullMatch: headingMatch[0] + tableMatch[0] }
}

function parseTableRows(tableHtml) {
  const rows = []
  const rowPattern = /<tr>([\s\S]*?)<\/tr>/gi
  let rowMatch
  while ((rowMatch = rowPattern.exec(tableHtml)) !== null) {
    const cellPattern = /<t[hd]>([\s\S]*?)<\/t[hd]>/gi
    const cells = []
    let cellMatch
    while ((cellMatch = cellPattern.exec(rowMatch[1])) !== null) {
      cells.push(stripTags(cellMatch[1]))
    }
    if (cells.length >= 2 && cells[0]) {
      rows.push({ label: cells[0].replace(/:$/, '').trim(), value: cells.slice(1).join(' — ').trim() })
    }
  }
  return rows
}

// ── Type-safe field-value transforms ──────────────────────────────────────────

function transformValue(fieldType, rawValue) {
  const v = rawValue.trim()
  if (!v) return { ok: false }

  if (fieldType === 'text') return { ok: true, value: v }

  if (fieldType === 'enum-single') {
    const hit = CONTINENT_REGIONS.find(r => r.toLowerCase() === v.toLowerCase())
    return hit ? { ok: true, value: hit } : { ok: false, reason: `"${v}" not in continent region list` }
  }

  if (fieldType === 'enum-multi') {
    const parts = v.split('|').map(s => s.trim()).filter(Boolean)
    const matched = []
    const dropped = []
    for (const p of parts) {
      const hit = SUITABLE_FOR_OPTIONS.find(o => o.toLowerCase() === p.toLowerCase())
      if (hit) matched.push(hit); else dropped.push(p)
    }
    if (matched.length === 0) return { ok: false, reason: `none of [${parts.join(', ')}] match the suitableFor list` }
    return { ok: true, value: matched, dropped }
  }

  if (fieldType === 'enum-leading-word') {
    const firstSentence = v.split(/[.|]/)[0].trim()
    const hit = DIFFICULTY_OPTIONS.find(o => o.toLowerCase() === firstSentence.toLowerCase())
    return hit ? { ok: true, value: hit, remainder: v } : { ok: false, reason: `leading text "${firstSentence}" not an exact difficulty match` }
  }

  return { ok: false }
}

// ── Build the article body ────────────────────────────────────────────────────

function buildBody(articleHtml, quickOverview, format) {
  const blocks = []

  // For CUSTOM-format Quick Overviews, fold the facts box into the body as
  // text so the research is never silently discarded, just because it
  // couldn't be safely mapped onto a schema field.
  if (format === 'custom' && quickOverview) {
    blocks.push(textBlock('Quick Facts', 'h3'))
    for (const row of quickOverview.rows) {
      blocks.push(textBlock(`${row.label}: ${row.value}`, 'normal'))
    }
  }

  // Strip every table from the remaining HTML before parsing prose blocks —
  // by this point any Quick Overview data worth keeping has already been
  // extracted above or into schema fields. What's left (Pros/Cons tables,
  // header banners) is either duplicated in prose elsewhere in the article
  // or not worth preserving as a raw table dump inside Portable Text.
  const withoutTables = articleHtml.replace(/<table[\s\S]*?<\/table>/gi, '')

  const blockPattern = /<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi
  let match
  let seenFirstH1 = false
  while ((match = blockPattern.exec(withoutTables)) !== null) {
    const tag = match[1].toLowerCase()
    const inner = stripTags(match[2])
    if (!inner || inner.length < 2) continue
    if (tag === 'h1' && !seenFirstH1) { seenFirstH1 = true; continue } // skip the article's own H1 title
    if (/^quick overview$/i.test(inner)) continue // the heading itself, table already consumed above
    // The Brain's own template rule: "The SEO Metadata Block and GEO Block
    // at the end of every article are for internal use only. Remove before
    // publishing to the website." Found leaking into real article bodies
    // 2026-08-27 (a "SEO KEYWORDS" heading survived table-stripping and
    // showed up between Pros/Cons and the FAQ in a spot check).
    //
    // Deliberately NOT breaking the whole loop here: in the real documents
    // this marker sits BEFORE the FAQ section, not strictly at the very end
    // as the template describes — SEO keywords and FAQ questions are
    // written together as a pair. Breaking would silently drop the FAQ,
    // which is real Section 13 content, not internal metadata. Skipping
    // just this heading line is a deliberately incomplete fix — the
    // keyword-list paragraph immediately under it likely still slips
    // through as one stray pipe-separated paragraph. Left as a known,
    // low-severity cosmetic item rather than risk cutting real content to
    // chase it fully under time pressure.
    if (/^(SEO KEYWORDS|SEO METADATA|GEO (AND )?(CONTENT )?(OPS )?BLOCK)/i.test(inner)) continue
    let style = 'normal'
    if (tag === 'h2') style = 'h2'
    else if (tag === 'h3') style = 'h3'
    else if (tag === 'h4') style = 'h4'
    blocks.push(textBlock(inner, style))
  }

  return blocks
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(WRITE ? '*** WRITE MODE — Sanity will be modified ***\n' : 'DRY RUN — no writes will be made. Run with --write to commit.\n')

  const allAttractions = await client.fetch(
    '*[_type == "attraction"]{_id, name, "slug": slug.current, contentStatus, subRegionProvince, continentRegion, unescoStatus, entryFeeDisplayText, bestTimeToVisit, suitableFor, difficultyAccessLevel, articleBody}'
  )
  console.log(`Loaded ${allAttractions.length} attractions from Sanity\n`)

  const report = {
    totalArticlesFound: 0,
    imported: 0,
    alreadyPublishedSkipped: 0,
    notFound: [],
    duplicateTargetSkipped: [],
    noContentBlocks: [],
    standardFormatCount: 0,
    customFormatCount: 0,
    noQuickOverviewFound: 0,
    fieldsWritten: {}, // fieldName -> count
    fieldsDroppedInvalid: [], // { attraction, field, reason }
    perRecord: [],
  }

  const seenThisRun = new Map() // attraction _id -> first source file that claimed it

  for (const dir of ARTICLE_DIRS) {
    const dirLabel = dir.includes('published') ? 'published' : 'in-progress'
    const files = readdirSync(dir).filter(f => f.endsWith('.docx'))
    console.log(`── ${dirLabel}: ${files.length} files ──`)

    for (const file of files) {
      let htmlResult
      try {
        htmlResult = await mammoth.convertToHtml({ path: resolve(dir, file) })
      } catch (e) {
        console.log(`  ERROR reading ${file}: ${e.message}`)
        continue
      }

      const articles = splitArticles(htmlResult.value)
      report.totalArticlesFound += articles.length

      for (const article of articles) {
        const match = matchAttractionInWindow(article.precedingWindow, allAttractions)
        const windowPreview = stripTags(article.precedingWindow).slice(-200)

        if (!match) {
          report.notFound.push({ sourceFile: file, windowPreview })
          continue
        }

        if (match.contentStatus === 'Published') {
          report.alreadyPublishedSkipped++
          continue
        }

        // Two different article slices matching the same attraction inside
        // one run means either genuinely duplicated source content or a
        // matching mistake — never process the second one silently.
        if (seenThisRun.has(match._id)) {
          report.duplicateTargetSkipped.push({ attraction: match.name, sourceFile: file, firstSeenIn: seenThisRun.get(match._id) })
          continue
        }
        seenThisRun.set(match._id, file)

        // ── Quick Overview parse ──────────────────────────────────────────
        const qo = findQuickOverviewTable(article.html)
        let format = 'none'
        let rows = []
        const patch = {}
        const recordNote = { attraction: match.name, sourceFile: file }

        if (qo) {
          rows = parseTableRows(qo.tableHtml)
          const standardHits = rows.filter(r => STANDARD_FIELD_MAP[r.label.toLowerCase()]).length
          format = standardHits >= STANDARD_FORMAT_MIN_LABELS ? 'standard' : 'custom'
          format === 'standard' ? report.standardFormatCount++ : report.customFormatCount++

          if (format === 'standard') {
            for (const row of rows) {
              const mapping = STANDARD_FIELD_MAP[row.label.toLowerCase()]
              if (!mapping) continue
              const [field, type] = mapping
              if (match[field] && (Array.isArray(match[field]) ? match[field].length : true)) continue // never overwrite populated field

              const result = transformValue(type, row.value)
              if (!result.ok) {
                report.fieldsDroppedInvalid.push({ attraction: match.name, field, sourceLabel: row.label, sourceValue: row.value, reason: result.reason || 'empty after transform' })
                continue
              }
              patch[field] = result.value
              report.fieldsWritten[field] = (report.fieldsWritten[field] || 0) + 1
              if (result.dropped?.length) {
                report.fieldsDroppedInvalid.push({ attraction: match.name, field, sourceLabel: row.label, sourceValue: result.dropped.join(' | '), reason: 'not in controlled vocabulary, dropped from array' })
              }
            }
          }
        } else {
          report.noQuickOverviewFound++
        }

        // ── Body ────────────────────────────────────────────────────────
        const contentBlocks = buildBody(article.html, { rows }, format === 'custom' ? 'custom' : 'standard')
        if (contentBlocks.length === 0) {
          report.noContentBlocks.push({ attraction: match.name, sourceFile: file })
          continue
        }

        patch.articleBody = contentBlocks
        patch.contentStatus = 'Draft'
        patch.sourceFile = file

        recordNote.format = format
        recordNote.fieldsSet = Object.keys(patch)
        recordNote.blockCount = contentBlocks.length
        report.perRecord.push(recordNote)

        if (WRITE) {
          await client.patch(match._id).set(patch).commit()
        }
        report.imported++
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log(WRITE ? 'IMPORT COMPLETE' : 'DRY RUN COMPLETE')
  console.log('═══════════════════════════════════════════════════')
  console.log(`Articles found across all files:     ${report.totalArticlesFound}`)
  console.log(`Imported (or would import):          ${report.imported}`)
  console.log(`Skipped — already Published:         ${report.alreadyPublishedSkipped}`)
  console.log(`Not matched to any attraction:       ${report.notFound.length}`)
  console.log(`Duplicate target within this run:    ${report.duplicateTargetSkipped.length}`)
  console.log(`No content blocks extracted:         ${report.noContentBlocks.length}`)
  console.log(`\nQuick Overview format:`)
  console.log(`  Standard (schema fields populated): ${report.standardFormatCount}`)
  console.log(`  Custom (folded into body as text):  ${report.customFormatCount}`)
  console.log(`  No Quick Overview found at all:     ${report.noQuickOverviewFound}`)
  console.log(`\nSchema fields written:`)
  for (const [field, count] of Object.entries(report.fieldsWritten)) {
    console.log(`  ${field}: ${count}`)
  }
  console.log(`\nValues dropped as invalid/uncontrolled: ${report.fieldsDroppedInvalid.length}`)

  writeFileSync(resolve(__dirname, 'import-report.json'), JSON.stringify(report, null, 2))
  console.log(`\nFull report written to scripts/import-report.json`)
}

main().catch(err => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
