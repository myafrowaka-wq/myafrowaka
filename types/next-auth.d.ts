import type { DefaultSession } from 'next-auth'

export type UserRole =
  | 'subscriber'
  | 'moderator'
  | 'contributor'
  | 'author-editor'
  | 'admin'
  | 'visitor'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }
}
