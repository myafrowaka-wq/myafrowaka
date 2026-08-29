import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { auth } from '@/auth'

// User Management is Admin-only (assigning roles is a step above the rest
// of /admin, which Contributor and Author-Editor can also reach). The page
// itself is a client component that fetches from /api/admin/users, which is
// already admin-gated server-side — but without this layout, a Contributor
// or Author-Editor navigating here directly by URL would render the page
// shell and just see a stuck spinner / "No users yet" instead of being sent
// away, since app/admin/layout.tsx only gates the section as a whole. This
// closes that gap with a real redirect, same as every other admin sub-route.
export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect({ href: '/admin', locale: await getLocale() })
  return children
}
