import { authConfig } from "@/server/auth.config"
import NextAuth from "next-auth"

// Soft gate for /app routes. The edge safe config verifies the session cookie and
// redirects unauthenticated visitors to /login. Server components do the full
// org scoped checks once inside.
export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/app/:path*"],
}
