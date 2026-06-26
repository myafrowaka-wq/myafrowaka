import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import type { UserRole } from '@/types/next-auth'

const SANITY_PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET!
const SANITY_TOKEN   = process.env.SANITY_API_WRITE_TOKEN!
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL ?? ''

const sanityUrl = `https://${SANITY_PROJECT}.api.sanity.io/v2024-01-01/data`

// ── Demo accounts ─────────────────────────────────────────────────────────────

const DEMO_PASSWORD = 'Demo1234!'

const DEMO_ACCOUNTS: Record<string, { name: string; role: UserRole }> = {
  'subscriber@demo.myafrowaka.com':  { name: 'Demo Subscriber',  role: 'subscriber'   },
  'moderator@demo.myafrowaka.com':   { name: 'Demo Moderator',   role: 'moderator'    },
  'contributor@demo.myafrowaka.com': { name: 'Demo Contributor', role: 'contributor'  },
  'author@demo.myafrowaka.com':      { name: 'Demo Author',      role: 'author-editor'},
  'admin@demo.myafrowaka.com':       { name: 'Demo Admin',       role: 'admin'        },
}

// ── Sanity helpers ─────────────────────────────────────────────────────────────

async function fetchRole(userId: string): Promise<string | null> {
  try {
    const query  = encodeURIComponent(`*[_type=="userRole" && userId=="${userId}"][0]{role}`)
    const res    = await fetch(`${sanityUrl}/query/${SANITY_DATASET}?query=${query}`, {
      headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
      cache: 'no-store',
    })
    const json   = await res.json()
    return json.result?.role ?? null
  } catch {
    return null
  }
}

async function createRole(userId: string, email: string, name: string, role: string) {
  try {
    await fetch(`${sanityUrl}/mutate/${SANITY_DATASET}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SANITY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mutations: [{
          create: {
            _type: 'userRole',
            userId,
            userEmail: email,
            userName: name,
            role,
            createdAt: new Date().toISOString(),
          },
        }],
      }),
    })
  } catch {
    // Non-fatal
  }
}

// ── NextAuth config ───────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email    = (credentials?.email    as string | undefined)?.toLowerCase() ?? ''
        const password = (credentials?.password as string | undefined) ?? ''
        if (!email || !password) return null
        const demo = DEMO_ACCOUNTS[email]
        if (!demo || password !== DEMO_PASSWORD) return null
        return { id: `demo-${email}`, email, name: demo.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id

        const demoRole = DEMO_ACCOUNTS[(user.email ?? '').toLowerCase()]?.role

        let role = await fetchRole(user.id as string)
        if (!role) {
          if (demoRole) {
            role = demoRole
          } else if (ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
            role = 'admin'
          } else {
            role = 'subscriber'
          }
          await createRole(user.id as string, user.email ?? '', user.name ?? '', role)
        }
        token.role = role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
})
