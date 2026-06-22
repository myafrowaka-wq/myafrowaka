import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact MyAfroWaka',
  description: 'Get in touch with the MyAfroWaka team. Questions, partnerships, or tips about African attractions.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <nav className="font-mono text-xs uppercase tracking-wider text-charcoal/40 mb-8 flex gap-1">
        <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-charcoal">Contact</span>
      </nav>

      <p className="font-mono text-xs uppercase tracking-widest text-ochre-600 mb-3">Get in Touch</p>
      <h1 className="font-display text-4xl text-charcoal mb-4">Contact Us</h1>
      <p className="text-charcoal/60 leading-relaxed mb-10">
        Questions about an attraction, partnership enquiries, or corrections to our guides. We read every message.
      </p>

      <form className="space-y-5" action="mailto:myafrowaka@gmail.com" method="GET">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-charcoal/50 block mb-2">
            Your Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400 bg-white"
            placeholder="John Okafor"
          />
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-charcoal/50 block mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400 bg-white"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-charcoal/50 block mb-2">
            Subject
          </label>
          <select
            name="subject"
            className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-charcoal bg-white focus:outline-none focus:border-ochre-400"
          >
            <option value="General Enquiry">General Enquiry</option>
            <option value="Partnership / Sponsorship">Partnership / Sponsorship</option>
            <option value="Attraction Correction">Attraction Correction</option>
            <option value="Press / Media">Press / Media</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-charcoal/50 block mb-2">
            Message
          </label>
          <textarea
            name="body"
            required
            rows={5}
            className="w-full border border-sand rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400 bg-white resize-none"
            placeholder="Tell us what's on your mind…"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-ochre-600 hover:bg-ochre-700 text-cream font-mono text-xs uppercase tracking-widest py-4 rounded-full transition-colors"
        >
          Send Message
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-sand">
        <p className="font-mono text-xs uppercase tracking-wider text-charcoal/40 mb-2">Direct Email</p>
        <a
          href="mailto:myafrowaka@gmail.com"
          className="text-ochre-600 hover:text-ochre-700 transition-colors font-sans"
        >
          myafrowaka@gmail.com
        </a>
      </div>
    </div>
  )
}
