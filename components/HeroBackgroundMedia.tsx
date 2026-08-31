'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// The hero's static image is always the first thing rendered — it's what a
// crawler, a slow connection, and (permanently) a prefers-reduced-motion
// visitor see, and it doubles as the video's own poster frame so there's
// never a blank/black flash while the clip loads. The <video> only mounts
// after a client-side check confirms the visitor hasn't asked for reduced
// motion — same pattern TypewriterHero already uses (see that component's
// own reduced-motion effect) rather than hiding it with CSS alone, which
// wouldn't reliably stop a browser from downloading and autoplaying it in
// the background regardless of prefers-reduced-motion.
export function HeroBackgroundMedia({
  imageSrc,
  imageAlt,
  videoSrc,
}: {
  imageSrc: string
  imageAlt: string
  videoSrc: string
}) {
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShowVideo(!mq.matches)
  }, [])

  // A <video autoPlay> element inserted into the DOM after initial mount
  // (which is exactly what happens here — it only renders once the
  // reduced-motion check above resolves) doesn't reliably autoplay from
  // the attribute alone in every browser; found live, confirmed via
  // `paused: true` on an element that had already finished loading.
  // Calling .play() explicitly once it's actually in the DOM is the fix
  // for that part — but it surfaced a second, real Chrome behaviour on
  // top: `AbortError: ...video-only background media was paused to save
  // power` (Chromium's power-saver heuristic for audio-less autoplay
  // video), caught live via a temporary debug log before being replaced
  // with the actual fix below. The documented mitigation is to resume on
  // the browser's own `pause` event rather than fight the policy — there's
  // no user-facing pause control on this element, so any pause it fires
  // on its own is exactly this power-saver kicking in, safe to just retry.
  useEffect(() => {
    const v = videoRef.current
    if (!showVideo || !v) return
    v.play().catch(() => {})
    const resume = () => { v.play().catch(() => {}) }
    v.addEventListener('pause', resume)
    return () => v.removeEventListener('pause', resume)
  }, [showVideo])

  return (
    <>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill priority
        className="object-cover object-center"
        sizes="100vw"
        quality={85}
      />
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay loop muted playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden="true"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </>
  )
}
