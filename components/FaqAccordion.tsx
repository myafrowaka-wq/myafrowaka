'use client'
import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className="border border-line dark-flip-border rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-sand/40 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-display font-semibold text-[14px] text-charcoal dark-flip-text pr-4 leading-snug">
                {item.question}
              </span>
              <svg
                className={`w-4 h-4 shrink-0 text-gold-500 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-2 border-t border-line dark-flip-border">
                  <p className="font-sans text-[13px] text-charcoal/60 dark-flip-muted leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
