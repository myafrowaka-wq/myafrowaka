'use client'
import { useEffect, useMemo, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapPin {
  key: string
  name: string
  lat: number
  lng: number
  day: number // 1-indexed, drives the pin colour so a route is readable at a glance
}

// Batch 4 — the itinerary map view. Leaflet + OpenStreetMap tiles: no API
// key, no billing account to sign up for (unlike a Google Maps embed),
// self-hosted marker icons (public/leaflet/) rather than hotlinking
// Leaflet's CDN default, matching this project's own image rule. Renders
// nothing but an honest empty state when no itinerary item yet has real
// coordinates — never a map centred on (0,0) or on a guessed location.
export function ItineraryMap({ pins }: { pins: MapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  // Distinct, readable colours per day rather than one flat pin colour —
  // a multi-day trip's route only reads as a route if each day is
  // visually distinguishable at a glance.
  const dayColors = useMemo(() => [
    '#a22e29', '#c9a227', '#2f6b4f', '#3a5a8c', '#8c4a9c', '#b0602e', '#4a8c8c', '#8c2e5a',
  ], [])

  useEffect(() => {
    if (!containerRef.current || pins.length === 0) return
    let cancelled = false

    import('leaflet').then(L => {
      if (cancelled || !containerRef.current) return

      // Fixes a well-known Leaflet + bundler issue: the default icon's
      // getIconUrl looks for a webpack asset path that doesn't exist
      // here. Point it at the self-hosted copies instead.
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: '/leaflet/marker-icon.png',
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView([pins[0].lat, pins[0].lng], 11)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapRef.current)
      }
      const map = mapRef.current

      // Clear previous markers/route on every re-render (itinerary changed).
      map.eachLayer(layer => {
        if ((layer as unknown as { _pinLayer?: boolean })._pinLayer) map.removeLayer(layer)
      })

      const byDay = new Map<number, MapPin[]>()
      for (const p of pins) byDay.set(p.day, [...(byDay.get(p.day) ?? []), p])

      for (const [day, dayPins] of byDay) {
        const color = dayColors[(day - 1) % dayColors.length]
        const coords = dayPins.map(p => [p.lat, p.lng] as [number, number])
        if (coords.length > 1) {
          const line = L.polyline(coords, { color, weight: 3, opacity: 0.6, dashArray: '6 6' }).addTo(map)
          ;(line as unknown as { _pinLayer: boolean })._pinLayer = true
        }
        for (const p of dayPins) {
          const marker = L.circleMarker([p.lat, p.lng], {
            radius: 9, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1,
          }).addTo(map).bindPopup(`<strong>${p.name}</strong><br/>Day ${p.day}`)
          ;(marker as unknown as { _pinLayer: boolean })._pinLayer = true
        }
      }

      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 })
    })

    return () => { cancelled = true }
  }, [pins, dayColors])

  useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null }, [])

  if (pins.length === 0) {
    return (
      <div className="border border-dashed border-line dark-flip-border rounded-2xl p-8 text-center">
        <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted">
          Add attractions with a known location to see them on a map.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-line dark-flip-border">
      <div ref={containerRef} style={{ height: 360, width: '100%' }} />
      <div className="flex items-center gap-4 flex-wrap px-4 py-2.5 bg-sand dark-flip-surf border-t border-line dark-flip-border">
        {Array.from(new Set(pins.map(p => p.day))).sort((a, b) => a - b).map(day => (
          <span key={day} className="flex items-center gap-1.5 font-sans text-[14px] text-charcoal/65 dark-flip-muted">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: dayColors[(day - 1) % dayColors.length] }} />
            Day {day}
          </span>
        ))}
      </div>
    </div>
  )
}
