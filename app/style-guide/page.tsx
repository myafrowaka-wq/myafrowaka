import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'

const colors = [
  { name: 'Crimson Pulse', token: 'crimson', hex: '#A22E29', role: 'Primary CTA / movement' },
  { name: 'Ochre Earth', token: 'ochre', hex: '#B55D39', role: 'Warm support / earth' },
  { name: 'Horizon Gold', token: 'gold', hex: '#D5A942', role: 'Highlight / premium / energy' },
  { name: 'Savannah Moss', token: 'moss', hex: '#3F6A3D', role: 'Growth / success / nature' },
  { name: 'Charcoal Black', token: 'charcoal', hex: '#29251A', role: 'Text / authority' },
]

const surfaces = [
  { name: 'Cream', hex: '#F7F2E9', border: true },
  { name: 'Sand', hex: '#EFE7D6', border: true },
  { name: 'Slate', hex: '#3B403E', border: false },
  { name: 'Ink', hex: '#1A1813', border: false },
]

export default function StyleGuide() {
  return (
    <main className="min-h-screen bg-cream px-6 py-16 max-w-5xl mx-auto">
      <div className="mb-16">
        <p className="font-mono text-xs uppercase tracking-widest text-charcoal-300 mb-2">MyAfroWaka</p>
        <h1 className="font-display font-black text-5xl text-charcoal mb-3">Style Guide</h1>
        <p className="font-sans text-charcoal-300 text-lg">Brand colours, typography, and components — the building blocks of the platform.</p>
      </div>

      {/* COLOURS */}
      <section className="mb-16">
        <h2 className="font-display font-semibold text-2xl text-charcoal mb-6">Brand Colours</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          {colors.map(c => (
            <div key={c.token}>
              <div className="h-24 rounded-[14px] shadow-soft mb-3" style={{ backgroundColor: c.hex }} />
              <p className="font-sans font-semibold text-sm text-charcoal">{c.name}</p>
              <p className="font-mono text-xs text-charcoal-300">{c.hex}</p>
              <p className="font-sans text-xs text-charcoal-300 mt-1">{c.role}</p>
            </div>
          ))}
        </div>

        <h3 className="font-sans font-semibold text-lg text-charcoal mb-4">Surfaces</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {surfaces.map(s => (
            <div key={s.name}>
              <div
                className={`h-16 rounded-[14px] mb-2 ${s.border ? 'border border-line' : ''}`}
                style={{ backgroundColor: s.hex }}
              />
              <p className="font-sans font-semibold text-sm text-charcoal">{s.name}</p>
              <p className="font-mono text-xs text-charcoal-300">{s.hex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="mb-16">
        <h2 className="font-display font-semibold text-2xl text-charcoal mb-6">Typography</h2>
        <div className="space-y-8">
          <div className="bg-sand rounded-[22px] p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-charcoal-300 mb-4">Display — Fraunces</p>
            <p className="font-display font-black text-5xl text-charcoal leading-tight mb-2">Africa Explained<br/>by Africans.</p>
            <p className="font-display font-semibold text-2xl text-ochre italic">Explore the continent.</p>
          </div>
          <div className="bg-sand rounded-[22px] p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-charcoal-300 mb-4">Body & UI — Outfit</p>
            <p className="font-sans font-light text-xl text-charcoal mb-2">Light 300 — Introductory paragraph text at its most elegant.</p>
            <p className="font-sans text-base text-charcoal mb-2">Regular 400 — Body copy, descriptions, and general interface text across the platform.</p>
            <p className="font-sans font-semibold text-base text-charcoal mb-2">Semibold 600 — Labels, navigation items, card titles, and UI controls.</p>
            <p className="font-sans font-bold text-base text-charcoal">Bold 700 — Strong emphasis, callouts, and primary interface actions.</p>
          </div>
          <div className="bg-sand rounded-[22px] p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-charcoal-300 mb-4">Mono — Space Mono</p>
            <p className="font-mono text-sm text-charcoal-300 uppercase tracking-widest mb-2">EXPLORE. CONNECT. AFRICA.</p>
            <p className="font-mono text-sm text-charcoal">Last Verified: Jan 2026 · 6.2°S, 35.7°E · UNESCO #003</p>
          </div>
        </div>
      </section>

      {/* WORDMARK */}
      <section className="mb-16">
        <h2 className="font-display font-semibold text-2xl text-charcoal mb-6">Wordmark</h2>
        <div className="bg-sand rounded-[22px] p-8 inline-block">
          <span className="font-display font-light text-4xl text-charcoal">my</span>
          <span className="font-display font-black text-4xl text-charcoal">afrowaka</span>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-charcoal-300 mt-1">Explore. Connect. Africa.</p>
        </div>
      </section>

      {/* BUTTONS */}
      <section className="mb-16">
        <h2 className="font-display font-semibold text-2xl text-charcoal mb-6">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Explore Attraction</Button>
          <Button variant="secondary">Learn More</Button>
          <Button variant="primary" href="#">Browse All Countries →</Button>
        </div>
      </section>

      {/* BADGES */}
      <section className="mb-16">
        <h2 className="font-display font-semibold text-2xl text-charcoal mb-6">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="verified">Last Verified Jan 2026</Badge>
          <Badge variant="unesco">UNESCO World Heritage</Badge>
          <Badge variant="tag">Wildlife</Badge>
          <Badge variant="tag">Adventure</Badge>
          <Badge variant="tag">Cultural</Badge>
        </div>
      </section>

      {/* CARDS */}
      <section className="mb-16">
        <h2 className="font-display font-semibold text-2xl text-charcoal mb-6">Attraction Card</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card
            title="Table Mountain National Park"
            country="South Africa"
            category="Natural Wonder"
            lastVerified="Jan 2026"
            isUNESCO={false}
            href="#"
          />
          <Card
            title="Great Pyramid of Giza"
            country="Egypt"
            category="Ancient Monument"
            lastVerified="Mar 2026"
            isUNESCO={true}
            href="#"
          />
          <Card
            title="Serengeti National Park"
            country="Tanzania"
            category="Wildlife Reserve"
            lastVerified="Feb 2026"
            isUNESCO={true}
            href="#"
          />
        </div>
      </section>

      {/* QUICK FACTS TABLE */}
      <section className="mb-16">
        <h2 className="font-display font-semibold text-2xl text-charcoal mb-6">Quick Facts Table</h2>
        <div className="bg-sand rounded-[22px] overflow-hidden border border-line">
          {[
            ['Best Time to Visit', 'May – October (dry season)'],
            ['Entry Fee', 'USD 30 per person'],
            ['Opening Hours', '6:00 AM – 6:00 PM daily'],
            ['Nearest City', 'Cape Town (20 km)'],
            ['UNESCO Status', 'World Heritage Site since 2004'],
            ['Coordinates', '33.9628° S, 18.4098° E'],
          ].map(([label, value], i) => (
            <div key={i} className={`flex justify-between items-center px-6 py-4 ${i % 2 === 0 ? 'bg-sand' : 'bg-cream'}`}>
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal-300">{label}</span>
              <span className="font-sans text-sm font-medium text-charcoal text-right">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
