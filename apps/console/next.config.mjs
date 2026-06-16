import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const monorepoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output for the Docker self host image, traced from the monorepo root.
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
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
  serverExternalPackages: [
    "postgres",
    "@anthropic-ai/sdk",
    "openai",
    "unpdf",
    "mammoth",
    "ioredis",
    "bullmq",
    "@aws-sdk/client-s3",
    "resend",
  ],
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
