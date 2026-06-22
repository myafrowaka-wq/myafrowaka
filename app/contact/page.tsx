import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact MyAfroWaka',
  description:
    'Get in touch with the MyAfroWaka team. Attraction corrections, partnership enquiries, media requests, and general questions.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 md:py-16">
      <nav className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 mb-8 flex gap-1">
        <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-charcoal">Contact</span>
      </nav>

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ochre-600 mb-3">Get in Touch</p>
      <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
        We Read Every Message.
      </h1>
      <p className="font-sans text-charcoal/60 leading-relaxed mb-10 text-lg">
        Corrections to attraction data, partnership and sponsorship enquiries, press requests,
        or a tip about a place we should cover. Send it here.
      </p>

      <form className="space-y-5" action={`mailto:myafrowaka@gmail.com`} method="GET">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/50 block mb-2">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400 bg-white transition-colors"
              placeholder="Amara Okafor"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/50 block mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400 bg-white transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/50 block mb-2">
            Reason for Contact
          </label>
          <select
            name="subject"
            className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal bg-white focus:outline-none focus:border-ochre-400 transition-colors"
          >
            <option value="General Enquiry">General Enquiry</option>
            <option value="Partnership / Sponsorship">Partnership / Sponsorship</option>
            <option value="Attraction Correction">Attraction Data Correction</option>
            <option value="Press / Media">Press / Media</option>
            <option value="Tourism Board">Tourism Board Enquiry</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/50 block mb-2">
            Message
          </label>
          <textarea
            name="body"
            required
            rows={5}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400 bg-white resize-none transition-colors"
            placeholder="Tell us what is on your mind. Specific is always better."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] font-bold uppercase tracking-[0.14em] py-4 rounded-full transition-colors"
        >
          Send Message
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-line flex flex-col sm:flex-row gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 mb-2">Direct Email</p>
          <a
            href="mailto:myafrowaka@gmail.com"
            className="font-sans text-ochre-600 hover:text-ochre-700 transition-colors"
          >
            myafrowaka@gmail.com
          </a>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 mb-2">Based In</p>
          <p className="font-sans text-charcoal/70">Abuja, Nigeria</p>
        </div>
      </div>
    </div>
  )
}
