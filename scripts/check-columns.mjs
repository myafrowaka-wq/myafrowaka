import XLSX from 'xlsx'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EXCEL_PATH = resolve(__dirname, '../../../01-Database/MyAfroWaka_Master_Attraction_Database_v2_2 (Recovered).xlsx')

const workbook = XLSX.readFile(EXCEL_PATH)
const sheet = workbook.Sheets['MASTER DATABASE']

// Get raw rows as arrays
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
console.log('Row 1 (merged title):', raw[0].slice(0, 5))
console.log('\nRow 2 (category headers):', raw[1].slice(0, 5))
console.log('\nRow 3 (column names):', raw[2])
console.log('\nRow 4 (first data row):', raw[3])
