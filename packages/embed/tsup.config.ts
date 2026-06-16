import { defineConfig } from "tsup"

// Builds a single self contained embed.js that mounts the widget in a Shadow DOM.
// React, react-dom, and the widget are bundled in so a host page needs nothing else.
export default defineConfig({
  entry: { embed: "src/embed.tsx" },
  format: ["iife"],
  globalName: "BeckonEmbed",
  platform: "browser",
  target: "es2020",
  minify: true,
  noExternal: [/.*/],
  outDir: "dist",
  clean: true,
  outExtension: () => ({ js: ".js" }),
  esbuildOptions(options) {
    options.jsx = "automatic"
    options.define = { "process.env.NODE_ENV": '"production"' }
  },
})
