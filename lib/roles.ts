import type { UserRole } from '@/types/next-auth'

// Session 4.1 — "build out the five roles properly." ROLE_ORDER and
// atLeast() existed as two independent, identical copies (components/
// DashboardSidebar.tsx and app/user-dashboard/page.tsx) before this session
// — the exact class of drift Session 2.4 found and fixed once already for
// the ATTRACTION_IMAGES map duplicated across 8 files, and Session 3.4
// found again for EventCard/VerificationBadge. One definition here instead.
//
// The five roles the plan names are Admin, Moderator, Editor, Contributor,
// Subscriber. The codebase's existing role value for "Editor" is
// 'author-editor' — kept as-is rather than renamed to a bare 'editor',
// since the Sanity schema's own field option already labels it
// "Author-Editor" as a deliberate disambiguation from the separate
// `author` content type (a blog post's byline, Session 2.3), and renaming
// a role value that already gates real permissions throughout a working
// system is a materially riskier change than preserving it. Displayed as
// "Editor" in plan-facing copy, stored as 'author-editor'.
//
// 'visitor' is kept as a valid stored value for backward compatibility
// with any existing record, but is not offered as an assignable role
// anywhere new — the Sanity schema itself already labels it "(legacy)."
// New sign-ins default to 'subscriber'.

export const ROLE_ORDER: UserRole[] = ['visitor', 'subscriber', 'moderator', 'contributor', 'author-editor', 'admin']

export function atLeast(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minRole)
}

export const ROLE_LABELS: Record<UserRole, string> = {
  visitor: 'Visitor',
  subscriber: 'Subscriber',
  moderator: 'Moderator',
  contributor: 'Contributor',
  'author-editor': 'Editor',
  admin: 'Admin',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  visitor: 'Legacy value from before the role system existed. Not assigned to new accounts.',
  subscriber: 'Default role for every new sign-in. Can browse, save attractions, and build trips.',
  moderator: 'Can review and moderate user-submitted comments and content.',
  contributor: 'Can create draft attractions and events and submit them for editorial review.',
  'author-editor': 'Can write, edit, and publish articles and events. The site\'s real editorial authority.',
  admin: 'Full access — publish content, manage users and roles, access every admin tool.',
}

/** Roles an admin can actively assign through the user-management UI —
 *  excludes 'visitor', which is legacy-only. */
export const ASSIGNABLE_ROLES: UserRole[] = ['subscriber', 'moderator', 'contributor', 'author-editor', 'admin']
