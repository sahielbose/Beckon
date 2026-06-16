/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@beckon/ui",
    "@beckon/shared",
    "@beckon/db",
    "@beckon/agent-core",
    "@beckon/gateway",
    "@beckon/react",
    "@beckon/client",
  ],
  // These run only on the server; keep them out of the client bundle.
  serverExternalPackages: ["postgres", "@anthropic-ai/sdk", "openai", "unpdf", "mammoth"],
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
