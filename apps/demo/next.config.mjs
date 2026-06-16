/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@beckon/ui", "@beckon/react", "@beckon/client", "@beckon/shared"],
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
