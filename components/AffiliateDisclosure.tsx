// Session 5.2 — "Every page carrying an affiliate link gets a visible
// disclosure. This is legally required in the US and UK... and it is also
// just the right thing to do on a site whose entire promise is that it
// tells the truth." The second sentence is why this also states, in the
// same breath, the rule 5.2b asks to be written down while it costs
// nothing to promise: money never touches verification.
export function AffiliateDisclosure() {
  return (
    <p className="font-sans text-[14px] text-charcoal/45 dark-flip-muted leading-relaxed">
      We may earn a commission on bookings made through the links below, at no extra cost to you. This never affects what we verify or recommend: a listing&rsquo;s <span className="whitespace-nowrap">Verified</span> status can&rsquo;t be bought.
    </p>
  )
}
