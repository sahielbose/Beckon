import type { NextAuthConfig } from "next-auth"

// Edge safe config shared by the middleware and the full server config. No
// database access and no node only modules here, so it can run in the middleware.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isApp = request.nextUrl.pathname.startsWith("/app")
      if (isApp) return Boolean(auth?.user)
      return true
    },
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id
      return token
    },
    session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
