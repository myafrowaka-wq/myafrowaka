import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Session 5.3 — the locale-aware replacements for next/link's Link,
// next/navigation's useRouter/redirect/usePathname. Same API as the
// next/* originals — a component written `<Link href="/attractions/foo">`
// needs nothing else changed, this Link automatically prepends whatever
// locale prefix is currently active (or none, for English). Every file
// that imported from 'next/link' or 'next/navigation' for these four now
// imports from here instead.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
