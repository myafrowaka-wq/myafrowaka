import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { TypewriterHero } from '@/components/TypewriterHero'

export const metadata: Metadata = {
  title: 'About MyAfroWaka – Africa Explained by Africans',
  description:
    'MyAfroWaka is a travel and destination discovery platform built from Abuja, Nigeria. We produce verified travel guides across Africa, written by people who actually live here.',
}

const PILLARS = [
  {
    title: 'Destinations',
    body: 'Country guides, city profiles, landmark discovery, and the hidden places that rarely appear in mainstream travel media.',
  },
  {
    title: 'Culture and Heritage',
    body: 'UNESCO World Heritage Sites, archaeological sites, living traditions, indigenous knowledge, and the architecture that tells Africa\'s full history.',
  },
  {
    title: 'Experiences',
    body: 'Safari, adventure, gorilla trekking, mountain hiking, island hopping, luxury travel, and the kind of experiences Africa does better than anywhere else on earth.',
  },
  {
    title: 'Food Tourism',
    body: 'Food trails, market guides, culinary destinations, and the restaurants, street stalls, and kitchens where the real story of African cooking lives.',
  },
  {
    title: 'Travel Planning',
    body: 'Visas, transport, costs, safety, and the practical information you actually need to move across a vast and varied continent.',
  },
]

const QUICK_LINKS = [
  { label: 'What We Do',       href: '#what-we-do'    },
  { label: 'Our Standards',    href: '#our-standards' },
  { label: 'What We Cover',    href: '#pillars'       },
  { label: 'Who We Write For', href: '#audience'      },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero — Ken Burns slow-zoom with vertically centred text */}
      <div className="relative overflow-hidden min-h-[520px] flex items-center">
        <Image
          src="https://picsum.photos/seed/africa-heritage-landscape-v2/1920/900"
          alt="African landscape"
          fill
          priority
          className="object-cover object-center img-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/72 to-ink/92"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-24 sm:py-32">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-400 mb-5">About MyAfroWaka</p>
          <h1 className="font-display font-extrabold text-cream max-w-3xl" style={{ fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: '0.96', letterSpacing: '-0.025em' }}>
            <TypewriterHero
              speed={28}
              lines={[
                { text: 'Africa Has Always Been' },
                { text: ' This Extraordinary.' },
              ]}
            />
          </h1>
          <p className="font-display font-medium italic text-gold-300 mt-5 max-w-xl"
            style={{ fontSize: 'clamp(16px, 1.8vw, 24px)', letterSpacing: '-0.015em' }}>
            We&rsquo;re just saying it out loud.
          </p>
        </div>
      </div>

      {/* Body: 2-col — main content + sticky sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">

          {/* Main content — 2/3 width */}
          <div className="lg:col-span-2">

            {/* Opening */}
            <div className="mb-14">
              <p className="font-sans text-lg leading-relaxed text-charcoal/80 dark-flip-muted mb-5">
                Most travel media discovers Africa in flashes. The safari. The pyramid. The beach.
                Then they go home and write about it.
              </p>
              <p className="font-sans text-lg leading-relaxed text-charcoal/80 dark-flip-muted mb-5">
                <strong className="text-charcoal dark-flip-text">MyAfroWaka is different because we live here.</strong> We were built from Abuja, Nigeria, not from a newsroom in London or New York.
                The people writing these guides grew up taking the same roads, bargaining in the same markets, and sitting in the same traffic as the people they are writing about.
              </p>
              <p className="font-sans text-base leading-relaxed text-charcoal/70 dark-flip-muted">
                That matters. Not because it makes for a better press release, but because the difference between a guide written by someone who visited for a week and one written by someone who has been going their whole life is the difference between a Wikipedia summary and an actual opinion.
              </p>
            </div>

            {/* What We Do */}
            <div id="what-we-do" className="mb-14 scroll-mt-24">
              <div className="w-8 h-px bg-gold-400 mb-6 opacity-60"/>
              <h2 className="font-display font-bold text-charcoal dark-flip-text mb-5" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', letterSpacing: '-0.018em' }}>
                What We Do
              </h2>
              <p className="font-sans text-base leading-relaxed text-charcoal/70 dark-flip-muted mb-4">
                We produce verified travel guides for Africa&rsquo;s greatest attractions. From the Roman ruins of Volubilis in Morocco to the flamingo lakes of Kenya&rsquo;s Rift Valley. From the jazz clubs of Johannesburg to the spice markets of Stone Town in Zanzibar.
              </p>
              <p className="font-sans text-base leading-relaxed text-charcoal/70 dark-flip-muted mb-4">
                Every guide covers what the place is, how to get there, what it costs, when to go, who should go, and why it matters. We name the airport. We give the driving distance in kilometres. We source the entry fee from the official website. We flag what we cannot verify at time of publication.
              </p>
              <p className="font-sans text-base leading-relaxed text-charcoal/70 dark-flip-muted">
                We do not guess. We do not round up. We do not paraphrase from Wikipedia and call it research.
              </p>
            </div>

            {/* Our Standards */}
            <div id="our-standards" className="mb-14 scroll-mt-24">
              <div className="w-8 h-px bg-gold-400 mb-6 opacity-60"/>
              <h2 className="font-display font-bold text-charcoal dark-flip-text mb-5" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', letterSpacing: '-0.018em' }}>
                Our Standards
              </h2>
              <div className="space-y-4">
                <p className="font-sans text-base leading-relaxed text-charcoal/70 dark-flip-muted">
                  Africa is not a country. Every guide names the specific country, province, and city. Not &ldquo;a destination in East Africa&rdquo; but &ldquo;Simien Mountains National Park in the Amhara region of Ethiopia, approximately 100 kilometres north of Gondar by road.&rdquo;
                </p>
                <p className="font-sans text-base leading-relaxed text-charcoal/70 dark-flip-muted">
                  No filler sentences. No &ldquo;breathtaking views.&rdquo; No &ldquo;must-visit destination.&rdquo; We use language that is precise because precision is a form of respect, for the places and the people who visit them.
                </p>
                <p className="font-sans text-base leading-relaxed text-charcoal/70 dark-flip-muted">
                  When a fact cannot be confirmed from a primary source at time of writing, it does not appear as confirmed fact. It is flagged and resolved before publication.
                </p>
              </div>
            </div>

            {/* Content pillars */}
            <div id="pillars" className="mb-14 scroll-mt-24">
              <div className="w-8 h-px bg-gold-400 mb-6 opacity-60"/>
              <h2 className="font-display font-bold text-charcoal dark-flip-text mb-8" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', letterSpacing: '-0.018em' }}>
                Five Editorial Pillars
              </h2>
              <div className="space-y-3">
                {PILLARS.map((p, i) => (
                  <div key={p.title}
                    className="group border border-line dark-flip-border rounded-2xl p-6 hover:border-gold-300 hover:shadow-[var(--shadow-soft)] transition-all">
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-[9px] text-charcoal/25 dark-flip-muted mt-1 shrink-0">0{i + 1}</span>
                      <div>
                        <h3 className="font-display font-bold text-base text-charcoal dark-flip-text mb-2 group-hover:text-crimson transition-colors">{p.title}</h3>
                        <p className="font-sans text-sm text-charcoal/60 dark-flip-muted leading-relaxed">{p.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who we serve */}
            <div id="audience" className="scroll-mt-24">
              <div className="w-8 h-px bg-gold-400 mb-6 opacity-60"/>
              <h2 className="font-display font-bold text-charcoal dark-flip-text mb-8" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', letterSpacing: '-0.018em' }}>
                Three Audiences. One Standard.
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  {
                    title: 'International Travelers',
                    body: 'Readers in the US, UK, Canada, Europe, and Australia researching Africa and wanting reliable, specific destination information they can plan an actual trip around.',
                  },
                  {
                    title: 'African Diaspora',
                    body: 'People living abroad who want to reconnect with the continent through heritage travel, cultural immersion, and authentic stories from home.',
                  },
                  {
                    title: 'Intra-African Travelers',
                    body: 'Africans exploring their own continent. The fastest-growing and most underserved audience in African travel. We build for them as much as anyone.',
                  },
                ].map(a => (
                  <div key={a.title} className="bg-sand dark-flip-surf rounded-2xl p-6">
                    <h4 className="font-display font-bold text-sm text-charcoal dark-flip-text mb-3">{a.title}</h4>
                    <p className="font-sans text-xs text-charcoal/60 dark-flip-muted leading-relaxed">{a.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — sticky */}
          <div className="lg:sticky lg:top-24 space-y-6">

            {/* Get in Touch card */}
            <div className="bg-ink rounded-3xl p-7 text-cream">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400 mb-3">Say Hello</p>
              <h3 className="font-display font-bold text-xl mb-3" style={{ letterSpacing: '-0.015em' }}>
                We actually read our emails.
              </h3>
              <p className="font-sans text-[13px] text-cream/60 leading-relaxed mb-6">
                Partnerships, press, corrections, or just a travel question you can&rsquo;t find answered anywhere else.
              </p>
              <a href="mailto:info@myafrowaka.com"
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gold-400 hover:text-gold-300 transition-colors mb-2">
                info@myafrowaka.com
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
              <Link href="/contact"
                className="mt-5 inline-flex w-full items-center justify-center bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[12px] uppercase tracking-[0.10em] py-3.5 rounded-xl transition-all btn-magnetic">
                Send a Message
              </Link>
            </div>

            {/* Quick navigation */}
            <div className="bg-sand dark-flip-surf rounded-3xl p-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/40 dark-flip-muted mb-4">On This Page</p>
              <nav className="space-y-1">
                {QUICK_LINKS.map(l => (
                  <a key={l.label} href={l.href}
                    className="flex items-center gap-2 font-sans text-[13px] text-charcoal/65 dark-flip-muted hover:text-crimson transition-colors py-1.5">
                    <span className="w-4 h-px bg-current opacity-40 shrink-0"/>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* What we believe */}
            <div className="border border-line dark-flip-border rounded-3xl p-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/40 dark-flip-muted mb-5">What We Believe</p>
              <ul className="space-y-4">
                {[
                  'Africa is not a monolith. Dozens of countries, thousands of languages, and more variation than most people are taught to expect.',
                  'The best travel writing comes from people who have skin in the game. Not tourists. Residents.',
                  'Accuracy is not optional. A wrong entry fee or a closed attraction is not a typo. It is a broken promise to a reader who planned a trip around it.',
                ].map((belief, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-mono text-[8px] text-gold-500 mt-0.5 shrink-0">0{i + 1}</span>
                    <p className="font-sans text-[12px] text-charcoal/60 dark-flip-muted leading-relaxed">{belief}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Link href="/search"
              className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/35 dark-flip-muted mb-1">Ready?</p>
                <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">Browse All Attractions</p>
              </div>
              <svg className="w-5 h-5 text-charcoal/30 group-hover:text-crimson transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
