/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@beckon/ui", "@beckon/shared", "@beckon/db"],
  // Postgres driver runs only on the server; keep it out of the bundle.
  serverExternalPackages: ["postgres"],
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
