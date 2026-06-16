/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@beckon/ui", "@beckon/shared", "@beckon/db", "@beckon/agent-core"],
  // These run only on the server; keep them out of the client bundle.
  serverExternalPackages: ["postgres", "@anthropic-ai/sdk", "openai", "unpdf", "mammoth"],
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
