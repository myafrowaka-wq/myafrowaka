import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About MyAfroWaka – Africa Explained by Africans',
  description:
    "MyAfroWaka is Africa's destination discovery platform, built and run from Abuja, Nigeria. We produce verified travel guides for 557 attractions across 47 countries.",
}

const PILLARS = [
  {
    title: 'Destinations',
    body: 'Country guides, city profiles, landmark discovery, and the hidden places that rarely appear in mainstream travel media.',
  },
  {
    title: 'Culture & Heritage',
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
    body: 'Visas, transport, costs, safety, and the practical information you actually need to move across a continent of 47 countries and 1.4 billion people.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero band */}
      <div className="bg-ink relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(213,169,66,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <nav className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/30 mb-6 flex gap-1">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-cream/50">About</span>
          </nav>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-400 mb-4">About MyAfroWaka</p>
          <h1 className="font-display text-4xl md:text-6xl text-cream leading-tight">
            Africa Has Always Been<br className="hidden md:block" /> This Extraordinary.<br />
            <span className="text-ochre-300 italic">We&rsquo;re Just Saying It Out Loud.</span>
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-16">

        {/* Opening */}
        <div className="prose prose-lg max-w-none mb-14
          prose-headings:font-display prose-headings:text-charcoal
          prose-h2:text-3xl prose-h2:mt-14 prose-h2:pb-2 prose-h2:border-b prose-h2:border-line
          prose-p:text-charcoal/80 prose-p:leading-relaxed prose-p:font-sans
          prose-a:text-ochre-600 prose-a:no-underline hover:prose-a:underline">

          <p className="text-xl leading-relaxed text-charcoal/80 font-sans not-prose mb-6">
            Most travel media discovers Africa in flashes. The safari. The pyramid. The beach.
            Then they go home and write about it.
          </p>
          <p className="text-xl leading-relaxed text-charcoal/80 font-sans not-prose mb-6">
            <strong className="text-charcoal">MyAfroWaka is different because we live here.</strong>
          </p>
          <p className="font-sans text-charcoal/75 leading-relaxed mb-6">
            We are a travel and destination discovery platform built and operated from Abuja, Nigeria, with a single conviction: that Africa is one of the most complex, beautiful, and chronically underreported places on earth, and that the people best placed to tell its story are the Africans who grew up navigating it.
          </p>
          <p className="font-sans text-charcoal/75 leading-relaxed">
            We are building toward the standard of National Geographic, Lonely Planet, and Cond&eacute; Nast Traveler, applied to a continent that has never had its own version of those publications. That is a large ambition. We are pursuing it one verified guide at a time.
          </p>

          <h2>What We Do</h2>
          <p>
            We produce verified travel guides for Africa&rsquo;s greatest attractions. 557 of them across 47 countries. From the Roman ruins of Volubilis in Morocco to the flamingo lakes of Kenya&rsquo;s Rift Valley. From the jazz clubs of Johannesburg to the spice markets of Stone Town, Zanzibar.
          </p>
          <p>
            Every guide covers what the place is, how to get there, what it costs, when to go, who should go, and why it matters. We name the airport. We give the driving distance in kilometres. We source the entry fee from the official website. We flag what we cannot verify at time of publication.
          </p>
          <p>
            We do not guess. We do not round up. We do not paraphrase from Wikipedia and call it research.
          </p>

          <h2>Our Standards</h2>
          <p>
            Africa is not a country. Every guide names the specific country, province, and city. Not &ldquo;a destination in East Africa&rdquo; but &ldquo;Bwindi Impenetrable National Park in southwestern Uganda, approximately 82 kilometres south of Kabale town.&rdquo;
          </p>
          <p>
            No em-dashes. No filler sentences. No &ldquo;breathtaking views.&rdquo; No &ldquo;must-visit destination.&rdquo; We use language that is precise because precision is a form of respect, for the places and the people who visit them.
          </p>
          <p>
            When a fact cannot be confirmed from a primary source at time of writing, it does not appear as confirmed fact. It is flagged, and resolved before publication.
          </p>
        </div>

        {/* Content pillars */}
        <div className="mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ochre-600 mb-3">What We Cover</p>
          <h2 className="font-display text-3xl text-charcoal mb-8">Five Editorial Pillars</h2>

          <div className="space-y-4">
            {PILLARS.map(p => (
              <div key={p.title} className="border border-line rounded-2xl p-6 hover:border-ochre-200 transition-colors">
                <h3 className="font-display text-lg text-charcoal mb-2">{p.title}</h3>
                <p className="text-sm text-charcoal/65 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Who we serve */}
        <div className="bg-sand rounded-2xl p-8 mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ochre-600 mb-3">Who We Write For</p>
          <h2 className="font-display text-2xl text-charcoal mb-5">Three Audiences. One Standard.</h2>
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
              <div key={a.title}>
                <h4 className="font-display text-base text-charcoal mb-2">{a.title}</h4>
                <p className="text-xs text-charcoal/65 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.12em] px-7 py-3.5 rounded-full transition-colors"
          >
            Get in Touch
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center border border-ochre-300 text-ochre-600 hover:bg-ochre-50 font-mono text-[11px] uppercase tracking-[0.12em] px-7 py-3.5 rounded-full transition-colors"
          >
            Browse All Attractions
          </Link>
        </div>
      </div>
    </>
  )
}
