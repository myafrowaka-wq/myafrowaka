import mammoth from 'mammoth'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = resolve(__dirname, '../../../02-Articles/published/MyAfroWaka_Batch1_Articles_1to3.docx')

const result = await mammoth.convertToHtml({ path: file })
// Print first 2000 chars of HTML to see tag structure
console.log(result.value.slice(0, 2000))
