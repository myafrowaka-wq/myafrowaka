import mammoth from 'mammoth'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = resolve(__dirname, '../../../02-Articles/published/MyAfroWaka_Batch1_Articles_1to3.docx')
const result = await mammoth.extractRawText({ path: file })
const text = result.value

// Search for SEO/Meta keywords
const idx = text.indexOf('Meta Title')
if (idx === -1) {
  console.log('No "Meta Title" found. Searching for "Focus Keyword"...')
  const idx2 = text.indexOf('Focus Keyword')
  if (idx2 === -1) {
    console.log('Not found. Last 500 chars:')
    console.log(text.slice(-500))
  } else {
    console.log('Found "Focus Keyword" at index', idx2)
    console.log(text.slice(idx2 - 100, idx2 + 500))
  }
} else {
  console.log('Found "Meta Title" at index', idx)
  console.log(text.slice(idx - 100, idx + 600))
}
