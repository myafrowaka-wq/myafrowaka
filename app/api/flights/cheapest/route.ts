import { NextResponse } from 'next/server'
import { getCheapestFlight, hasFlightPricing } from '@/lib/flightPricing'

// Batch 3 — server-side proxy so the Travelpayouts token never reaches the
// browser. Called by FlightPriceChip.tsx once a visitor types an origin
// airport. Returns { available: false } honestly whenever pricing isn't
// configured or the lookup fails — never a fabricated number.
export async function GET(req: Request) {
  if (!hasFlightPricing) return NextResponse.json({ available: false })

  const { searchParams } = new URL(req.url)
  const origin = searchParams.get('origin')?.trim().toUpperCase()
  const destination = searchParams.get('destination')?.trim().toUpperCase()
  if (!origin || !destination || origin.length !== 3 || destination.length !== 3) {
    return NextResponse.json({ error: 'origin and destination must be 3-letter IATA codes' }, { status: 400 })
  }

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const departMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`

  const result = await getCheapestFlight(origin, destination, departMonth)
  if (!result) return NextResponse.json({ available: false })
  return NextResponse.json({ available: true, ...result })
}
