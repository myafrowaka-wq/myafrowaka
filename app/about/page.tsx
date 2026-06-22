import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About MyAfroWaka – Africa Explained by Africans',
  description: 'MyAfroWaka is Africa\'s leading travel and destination discovery platform. We showcase the beauty, culture, and diversity of the continent through verified travel guides.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="font-mono text-xs uppercase tracking-wider text-charcoal/40 mb-8 flex gap-1">
        <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-charcoal">About</span>
      </nav>

      <p className="font-mono text-xs uppercase tracking-widest text-ochre-600 mb-3">About Us</p>
      <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-6">
        Africa Explained by Africans
      </h1>

      <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-charcoal prose-p:text-charcoal/80 prose-p:leading-relaxed">
        <p>
          MyAfroWaka is a travel and destination discovery platform built to showcase the beauty, diversity, culture, and history of Africa. We are based in Abuja, Nigeria.
        </p>

        <p>
          Africa remains one of the most misunderstood continents in global media. Most narratives focus on poverty, conflict, and crisis. MyAfroWaka exists to offer something different: verified, specific, and authentic travel guides written by people who know the continent.
        </p>

        <h2>What We Do</h2>
        <p>
          We produce verified travel guides for Africa's greatest attractions. Every guide covers what the attraction is, how to get there, what it costs, when to visit, and why it matters. We name specific countries, cities, and regions. We do not flatten Africa into safari clichés.
        </p>

        <p>
          Our database covers 557 attractions across 47 African countries. Every published guide is checked for accuracy before publication.
        </p>

        <h2>Our Standards</h2>
        <p>
          We are authoritative but warm. We are the knowledgeable local, not the foreign tourist. We are specific over vague. We are practical. We give people what they actually need to travel.
        </p>

        <p>
          We do not fabricate facts. Entry fees, distances, visa rules, and opening hours are sourced from primary sources and flagged when unverified.
        </p>

        <h2>Get in Touch</h2>
        <p>
          Have a question, a tip about an attraction, or a partnership enquiry? We would love to hear from you.
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/contact"
          className="bg-ochre-600 hover:bg-ochre-700 text-cream font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors"
        >
          Contact Us
        </Link>
        <Link
          href="/search"
          className="border border-ochre-300 text-ochre-600 hover:bg-ochre-50 font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors"
        >
          Browse Attractions
        </Link>
      </div>
    </div>
  )
}
