import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

// Site-wide default Open Graph / Twitter card image.
//
// Session 2.4 replaced a hotlinked Unsplash "golden hour" stock photo here
// (also a WDOS C-15 violation — golden-hour warm tint is a banned aesthetic,
// on top of being a hotlink). A stock photo was never the right image for
// the site's own default social card anyway: this is the one OG image that
// represents MyAfroWaka itself, not a specific destination, so it should be
// the brand, not a photo of somewhere it doesn't own. Built here from the
// real wordmark and the real design-token palette instead — self-hosted by
// construction, since it's rendered server-side at build time, not fetched
// from anywhere.

export const runtime = 'nodejs'
export const alt = 'MyAfroWaka: Africa Explained by Africans'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), 'public', 'logo-white.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1A1813',
          backgroundImage:
            'radial-gradient(circle at 18% 20%, rgba(162,46,41,0.35) 0%, rgba(26,24,19,0) 45%), radial-gradient(circle at 85% 85%, rgba(218,192,97,0.18) 0%, rgba(26,24,19,0) 50%)',
          padding: '80px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={520} height={139} alt="" style={{ marginBottom: 44 }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 28,
          }}
        >
          <div style={{ width: 44, height: 2, backgroundColor: '#DAC061', display: 'flex' }} />
          <span
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#DAC061',
              fontWeight: 700,
            }}
          >
            Africa Explained by Africans
          </span>
          <div style={{ width: 44, height: 2, backgroundColor: '#DAC061', display: 'flex' }} />
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#F7F2E9',
            textAlign: 'center',
            maxWidth: 880,
            lineHeight: 1.25,
            display: 'flex',
          }}
        >
          Verified travel guides to Africa&apos;s greatest destinations
        </div>
      </div>
    ),
    { ...size }
  )
}
