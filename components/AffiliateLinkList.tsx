import type { ReactNode } from 'react'
import { AffiliateDisclosure } from '@/components/AffiliateDisclosure'

// Session 5.2 — the actual rendering of a page's tracked affiliate links.
// Used on attraction pages ("Where to Stay"), event pages (accommodation),
// and the trip planner's country-scoped booking widget — one component so
// the link markup (rel="sponsored", the /go/[slug] indirection, the
// disclosure) can't drift between the three places it appears.

export interface AffiliateLinkData {
  label: string
  partnerName: string
  linkType: string
  slug: string
}

const TYPE_ICON: Record<string, ReactNode> = {
  Hotel: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4M9 9h.01M9 13h.01M15 9h.01M15 13h.01" />
    </svg>
  ),
  Tour: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  Ticket: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Transport: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 17h8m-8 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM3 17V9a2 2 0 012-2h10l4 4v6" />
    </svg>
  ),
  Other: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
    </svg>
  ),
}

export function AffiliateLinkList({ links, title = 'Where to Stay' }: { links: AffiliateLinkData[]; title?: string }) {
  if (links.length === 0) return null

  return (
    <div className="border border-line dark-flip-border rounded-3xl p-6">
      {/* Session 6.3 (WDOS T-11, eyebrow cap) — this was eyebrow-styled
          with no separate heading to belong to, on every page that uses
          this shared component (attractions/[slug], destinations/[slug],
          events/[slug], the trip planner). A real heading now, matching
          the same fix applied to that same sidebar's other cards. */}
      <h3 className="font-display font-bold text-[15px] text-charcoal dark-flip-text mb-4">{title}</h3>
      <div className="space-y-2 mb-5">
        {links.map(link => (
          <a
            key={link.slug}
            href={`/go/${link.slug}`}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="flex items-center gap-3 group py-2 px-3 -mx-3 rounded-xl hover:bg-sand dark-flip-surf transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center text-gold-600 dark:text-gold-400 shrink-0">
              {TYPE_ICON[link.linkType] ?? TYPE_ICON.Other}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-sans text-sm text-charcoal dark-flip-text group-hover:text-crimson transition-colors">{link.label}</span>
              <span className="block font-sans text-[14px] text-charcoal/45 dark-flip-muted">{link.partnerName}</span>
            </span>
            <svg className="w-3.5 h-3.5 text-charcoal/65 dark-flip-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
      <AffiliateDisclosure />
    </div>
  )
}
