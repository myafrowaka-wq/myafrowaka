import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { client } from '@/sanity/lib/client'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import type { UserRole } from '@/types/next-auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { user } = session
  const role = (user.role ?? 'subscriber') as UserRole

  const savedCount = await client
    .fetch<number>(`count(*[_type == "savedAttraction" && userId == $userId])`, { userId: user.id })
    .catch(() => 0)

  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/' })
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-cream dark-flip-bg">
      <DashboardSidebar
        role={role}
        userName={user.name ?? ''}
        userEmail={user.email ?? ''}
        initials={initials}
        savedCount={savedCount}
        signOutAction={handleSignOut}
      />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
