import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { hreflangAlternates } from '@/lib/hreflang'

// Session 3.3 — the plan requires this be "written down and published, so
// it is a documented editorial judgement rather than an opinion." This
// page is that document: the real 1-5 rubric behind every dimension of the
// MyAfroWaka Experience Score, linked from every event page that shows one.

export const metadata: Metadata = {
  title: { absolute: 'The MyAfroWaka Experience Score – How We Score Events' }, // Session 6.2 — see app/[locale]/login/page.tsx's comment: opts out of the parent title.template so this doesn't render doubled.
  description: 'The published rubric behind the MyAfroWaka Experience Score — how we score African events across eight dimensions, and what each number actually means.',
  alternates: { canonical: 'https://myafrowaka.com/events/experience-score', languages: hreflangAlternates('https://myafrowaka.com/events/experience-score') },
}

interface Dimension {
  name: string
  question: string
  anchors: { score: string; text: string }[]
}

const DIMENSIONS: Dimension[] = [
  {
    name: 'Cultural Depth',
    question: 'How much does this event actually reveal about local tradition, belief, or history — versus being a spectacle staged for an audience?',
    anchors: [
      { score: '1', text: 'A commercial event with little connection to a specific local tradition.' },
      { score: '3', text: 'A real cultural event, but one a visitor can understand and appreciate without much prior context.' },
      { score: '5', text: 'A living tradition, often centuries old, where the meaning runs deeper the more you learn — the kind of thing a short write-up can only gesture at.' },
    ],
  },
  {
    name: 'International Appeal',
    question: 'How readily can a first-time visitor from outside the region engage with this, practically and emotionally?',
    anchors: [
      { score: '1', text: 'Primarily meaningful to people already inside the culture; a foreign visitor would likely feel like an observer at best.' },
      { score: '3', text: 'Genuinely welcoming to outside visitors, with some language or logistical friction to plan around.' },
      { score: '5', text: 'Immediately compelling and comprehensible to a global audience, with established visitor infrastructure already built around it.' },
    ],
  },
  {
    name: 'Music',
    question: 'How central is live musical performance to the experience, and how good is it?',
    anchors: [
      { score: '1', text: 'Music is absent or incidental.' },
      { score: '3', text: 'Real, good live music is part of the event, but not its centre of gravity.' },
      { score: '5', text: 'Music is the event — a reason on its own to attend, performed by musicians worth travelling for.' },
    ],
  },
  {
    name: 'Food',
    question: 'How central and accessible is real food culture at this event?',
    anchors: [
      { score: '1', text: 'Little or no food culture on offer, or only generic vendor fare.' },
      { score: '3', text: 'Real regional food is available and worth seeking out at the event.' },
      { score: '5', text: 'Food is a defining part of the event itself — dishes, traditions, or a market that alone justify going.' },
    ],
  },
  {
    name: 'Family Suitability',
    question: 'How appropriate, safe, and enjoyable is this event for travelling with children?',
    anchors: [
      { score: '1', text: 'Not suitable for children — crowding, sacred/restricted content, or safety concerns rule it out.' },
      { score: '3', text: 'Workable for families with some planning around crowd size, heat, or timing.' },
      { score: '5', text: 'Genuinely built for a family day out, with space, pace, and content that welcomes children.' },
    ],
  },
  {
    name: 'Accessibility',
    question: 'How easy is this to actually get to, move around at, and navigate for someone unfamiliar with the area — including mobility considerations?',
    anchors: [
      { score: '1', text: 'Remote, physically demanding to reach or move around at, or requires significant local knowledge to attend safely.' },
      { score: '3', text: 'Reachable with ordinary trip planning; some walking, crowding, or uneven terrain to expect.' },
      { score: '5', text: 'Straightforward to reach and navigate, including for visitors with limited mobility.' },
    ],
  },
  {
    name: 'Photography',
    question: 'How visually rewarding is this event, and how permissive is it of photography?',
    anchors: [
      { score: '1', text: 'Visually unremarkable, or photography is restricted for cultural/religious reasons (see that event’s Cultural Etiquette section — a low score here is never a reason to override those rules).' },
      { score: '3', text: 'Good, real photo opportunities with the usual crowd/lighting challenges.' },
      { score: '5', text: 'Exceptional, distinctive visuals — the kind of event a photographer would plan a trip around on its own.' },
    ],
  },
  {
    name: 'Travel Infrastructure',
    question: 'How developed is the surrounding transport, accommodation, and visitor infrastructure?',
    anchors: [
      { score: '1', text: 'Limited accommodation and transport options nearby; getting there and staying takes real effort.' },
      { score: '3', text: 'Adequate infrastructure for an independent traveller with some advance booking.' },
      { score: '5', text: 'Well-developed infrastructure — this is a place used to hosting visitors.' },
    ],
  },
]

export default function ExperienceScorePage() {
  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-8 flex gap-1">
          <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
          <span>/</span>
          <Link href="/events" className="hover:text-crimson transition-colors">Events</Link>
          <span>/</span>
          <span className="text-charcoal dark-flip-text">Experience Score</span>
        </nav>

        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-3">Our Methodology</p>
        <h1 className="font-display font-extrabold text-charcoal dark-flip-text mb-6"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.02em', lineHeight: '1.05' }}>
          The MyAfroWaka Experience Score
        </h1>
        <p className="font-sans text-[16px] text-charcoal/70 dark-flip-muted leading-relaxed mb-6">
          Ranking festivals against each other is meaningless — a national independence day and a five-day music
          festival aren&rsquo;t competing for the same trip. Instead, every event we cover is scored on its own
          terms, 1 to 5, across eight dimensions. Those eight scores average into a single number: the MyAfroWaka
          Experience Score.
        </p>
        <p className="font-sans text-[16px] text-charcoal/70 dark-flip-muted leading-relaxed mb-12">
          This is editorial judgement, not a fact pulled from an official page — which is exactly why it&rsquo;s
          written down here. If you disagree with a score on a specific event, the reasoning behind it (where we&rsquo;ve
          recorded one) is visible on that event&rsquo;s own page.
        </p>

        <div className="space-y-10">
          {DIMENSIONS.map((d, i) => (
            <div key={d.name} className="border-t border-line dark-flip-border pt-8 first:border-t-0 first:pt-0">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display font-bold text-crimson text-sm">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-display font-bold text-charcoal dark-flip-text text-xl" style={{ letterSpacing: '-0.012em' }}>
                  {d.name}
                </h2>
              </div>
              <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed mb-4">{d.question}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {d.anchors.map(a => (
                  <div key={a.score} className="bg-white dark-flip-card border border-line dark-flip-border rounded-xl p-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sand dark-flip-surf font-display font-bold text-[14px] text-charcoal dark-flip-text mb-2">
                      {a.score}
                    </span>
                    <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted leading-relaxed">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-line dark-flip-border">
          <h2 className="font-display font-bold text-charcoal dark-flip-text text-lg mb-3">A score is never a reason to skip Cultural Etiquette</h2>
          <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed mb-6">
            The Experience Score describes what to expect. It is separate from, and never overrides, an event&rsquo;s
            Cultural Etiquette section — the rules on photography, dress, and access that exist because many of
            these events are religious or sacred. Every event page carries that section, whether or not it has a
            score yet.
          </p>
          <Link href="/events" className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
            &larr; Back to all events
          </Link>
        </div>
      </div>
    </div>
  )
}
