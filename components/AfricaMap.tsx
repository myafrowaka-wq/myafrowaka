'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AFRICA_PATH =
  'M 130,20 C 162,10 202,6 255,13 C 300,20 330,36 358,68 ' +
  'C 380,96 396,128 402,162 C 406,188 402,212 386,234 ' +
  'C 372,254 358,272 348,296 C 336,322 326,350 308,382 ' +
  'C 290,414 264,444 228,464 C 205,476 180,468 155,452 ' +
  'C 130,436 116,414 105,388 C 92,362 86,334 86,308 ' +
  'C 86,282 76,264 64,246 C 52,228 50,212 56,196 ' +
  'C 62,180 74,166 90,152 C 106,138 114,118 120,90 ' +
  'C 126,66 128,44 130,20 Z'

const MADAGASCAR_PATH =
  'M 378,318 C 393,330 401,358 396,388 C 391,418 378,434 365,428 ' +
  'C 353,422 348,408 352,382 C 356,354 364,308 378,318 Z'

interface Region {
  name:   string
  slug:   string
  color:  string
  textColor: string
  cx:     number
  cy:     number
  r:      number
  lines:  string[]
}

const REGIONS: Region[] = [
  {
    name: 'North Africa', slug: 'North+Africa',
    color: '#A22E29', textColor: '#fff',
    cx: 215, cy: 92, r: 34,
    lines: ['North', 'Africa'],
  },
  {
    name: 'West Africa', slug: 'West+Africa',
    color: '#B55D39', textColor: '#fff',
    cx: 90, cy: 226, r: 30,
    lines: ['West', 'Africa'],
  },
  {
    name: 'East Africa', slug: 'East+Africa',
    color: '#3F6A3D', textColor: '#fff',
    cx: 328, cy: 225, r: 30,
    lines: ['East', 'Africa'],
  },
  {
    name: 'Central Africa', slug: 'Central+Africa',
    color: '#B28E38', textColor: '#fff',
    cx: 200, cy: 308, r: 30,
    lines: ['Central', 'Africa'],
  },
  {
    name: 'Southern Africa', slug: 'Southern+Africa',
    color: '#29251A', textColor: '#fff',
    cx: 200, cy: 418, r: 32,
    lines: ['Southern', 'Africa'],
  },
  {
    name: 'Indian Ocean Islands', slug: 'Indian+Ocean+Islands',
    color: '#3B403E', textColor: '#fff',
    cx: 383, cy: 375, r: 28,
    lines: ['Islands'],
  },
]

export function AfricaMap() {
  const [hovered, setHovered] = useState<string | null>(null)
  const router = useRouter()

  return (
    <div className="relative w-full flex items-center justify-center">
      <svg
        viewBox="0 0 440 510"
        className="w-full max-w-md"
        aria-label="Interactive map of Africa divided into six travel regions"
      >
        {/* ── Continent outline ────────────────────────────────── */}
        <path
          d={AFRICA_PATH}
          fill="#EFE7D6"
          stroke="#D9CDB6"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* ── Madagascar ───────────────────────────────────────── */}
        <path
          d={MADAGASCAR_PATH}
          fill="#EFE7D6"
          stroke="#D9CDB6"
          strokeWidth="1"
        />

        {/* ── IO Islands connecting dot ─────────────────────────── */}
        <circle cx="360" cy="330" r="2" fill="#D9CDB6" />
        <circle cx="370" cy="345" r="1.5" fill="#D9CDB6" />

        {/* ── Region zones ─────────────────────────────────────── */}
        {REGIONS.map(r => {
          const isHover = hovered === r.name
          const radius  = isHover ? r.r + 6 : r.r
          return (
            <g
              key={r.name}
              role="button"
              aria-label={`Explore ${r.name}`}
              tabIndex={0}
              onClick={() => router.push(`/search?region=${r.slug}`)}
              onKeyDown={e => e.key === 'Enter' && router.push(`/search?region=${r.slug}`)}
              onMouseEnter={() => setHovered(r.name)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
              style={{ outline: 'none' }}
            >
              {/* Glow on hover */}
              {isHover && (
                <circle
                  cx={r.cx} cy={r.cy}
                  r={radius + 8}
                  fill={r.color}
                  opacity="0.18"
                />
              )}

              <circle
                cx={r.cx} cy={r.cy}
                r={radius}
                fill={r.color}
                opacity={isHover ? 0.92 : 0.78}
                style={{ transition: 'r 0.15s ease, opacity 0.15s ease' }}
              />

              {/* Region label (two lines via tspan) */}
              <text
                textAnchor="middle"
                fill={r.textColor}
                fontSize="7.5"
                fontFamily="'Space Mono', monospace"
                fontWeight="700"
                letterSpacing="0.02em"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {r.lines.length === 1 ? (
                  <tspan x={r.cx} y={r.cy + 3}>{r.lines[0]}</tspan>
                ) : (
                  <>
                    <tspan x={r.cx} y={r.cy - 2}>{r.lines[0]}</tspan>
                    <tspan x={r.cx} y={r.cy + 9}>{r.lines[1]}</tspan>
                  </>
                )}
              </text>

              {/* Hover tooltip */}
              {isHover && (
                <g>
                  <rect
                    x={r.cx - 52} y={r.cy - r.r - 30}
                    width={104} height={22} rx="5"
                    fill={r.color} opacity="0.95"
                  />
                  <text
                    x={r.cx} y={r.cy - r.r - 14}
                    textAnchor="middle" fill="white"
                    fontSize="7" fontFamily="'Space Mono', monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    {r.name} →
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
