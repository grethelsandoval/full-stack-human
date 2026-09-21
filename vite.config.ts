import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Serve the same SPA shell at /app for static hosts without rewrites. */
function dappEntry(): Plugin {
  let outDir = "dist";
  return {
    name: "fsh-dapp-entry",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      mkdirSync(resolve(outDir, "app"), { recursive: true });
      copyFileSync(
        resolve(outDir, "index.html"),
        resolve(outDir, "app", "index.html"),
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), dappEntry()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: false,
  },
});
