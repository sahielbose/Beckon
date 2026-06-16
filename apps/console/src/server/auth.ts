import { verifyPassword } from "@/lib/password"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { accounts, db, sessions, users, verificationTokens } from "@beckon/db"
import { eq } from "drizzle-orm"
import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { authConfig } from "./auth.config"
import { ensureOrgForUser } from "./tenancy"

const providers: Provider[] = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "")
        .toLowerCase()
        .trim()
      const password = String(credentials?.password ?? "")
      if (!email || !password) return null

      const user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0]
      if (!user?.passwordHash) return null
      if (!verifyPassword(password, user.passwordHash)) return null

      return { id: user.id, email: user.email, name: user.name, image: user.image }
    },
  }),
]

// Enable GitHub only when configured. OAuth credentials arrive in Section 17.
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub)
}

export const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers,
  events: {
    async signIn({ user }) {
      if (user.id) await ensureOrgForUser(user.id)
    },
  },
})
