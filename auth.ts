import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const SANITY_PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET!
const SANITY_TOKEN   = process.env.SANITY_API_WRITE_TOKEN!
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL ?? ''

const sanityUrl = `https://${SANITY_PROJECT}.api.sanity.io/v2024-01-01/data`

async function fetchRole(userId: string): Promise<string | null> {
  const query  = encodeURIComponent(`*[_type=="userRole" && userId=="${userId}"][0]{role}`)
  const res    = await fetch(`${sanityUrl}/query/${SANITY_DATASET}?query=${query}`, {
    headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
    cache: 'no-store',
  })
  const json   = await res.json()
  return json.result?.role ?? null
}

async function createRole(userId: string, email: string, name: string, role: string) {
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
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id

        // First sign-in: fetch or create role document
        let role = await fetchRole(user.id as string)
        if (!role) {
          const isAdmin = ADMIN_EMAIL && user.email === ADMIN_EMAIL
          role = isAdmin ? 'admin' : 'visitor'
          await createRole(user.id as string, user.email ?? '', user.name ?? '', role)
        }
        token.role = role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as 'visitor' | 'contributor' | 'admin'
      }
      return session
    },
  },
})
