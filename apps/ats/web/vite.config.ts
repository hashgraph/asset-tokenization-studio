// SPDX-License-Identifier: Apache-2.0

import commonjs from "@rollup/plugin-commonjs";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import EnvironmentPlugin from "vite-plugin-environment";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Origins allowed to make cross-origin requests to the local dev/preview server.
const LOCAL_DEV_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

export default {
  plugins: [
    react(),
    EnvironmentPlugin("all"),
    pluginRewriteAll(),
    tsconfigPaths(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        fs: "memfs",
      },
      include: ["buffer", "process", "util", "stream", "crypto", "os", "vm"],
      exclude: ["http", "https", "url", "querystring", "path", "fs"],
    }),
  ],
  define: {
    ...(process.env.NODE_ENV === "development" ? { global: "globalThis" } : {}),
  },
  resolve: {
    alias: {
      events: path.resolve(__dirname, "../../../node_modules/events/events.js"),
      dotenv: "/src/dotenv-mock.js",
      winston: "/src/winston-mock.js",
      "winston-daily-rotate-file": "/src/winston-mock.js",
      "winston-transport": "/src/winston-mock.js",
    },
    dedupe: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
  },
  optimizeDeps: {
    include: [
      "@hashgraph/asset-tokenization-contracts",
      "@hashgraph/asset-tokenization-sdk",
      "@chakra-ui/react",
      "@emotion/react",
      "@emotion/styled",
      "framer-motion",
      "buffer",
      "readable-stream",
    ],
    exclude: ["dotenv", "winston", "winston-daily-rotate-file", "winston-transport"],
    esbuildOptions: {
      define: {
        global: "globalThis",
        "process.browser": "true",
      },
      plugins: [
        {
          name: "fix-events-polyfill",
          setup(build: any) {
            build.onResolve({ filter: /^events$/ }, () => ({
              path: path.resolve(__dirname, "../../../node_modules/events/events.js"),
            }));
          },
        },
        {
          name: "fix-dotenv-browser",
          setup(build: any) {
            build.onResolve({ filter: /^dotenv(\/|$)/ }, () => ({
              path: path.resolve(__dirname, "src/dotenv-mock.js"),
            }));
          },
        },
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        commonjs({
          include: ["**/packages/ats/contracts/**"],
        }),
      ],
    },
  },
  server: {
    port: 5174,
    sourcemap: true, // Source maps are enabled for debugging in browser
    // Bind to loopback only (pass `--host` explicitly when LAN access is really needed).
    host: "localhost",
    // Only pages served from this machine may read dev-server responses cross-origin;
    // Vite 4.5.5 otherwise answers any origin, so another site open in the browser could read the source.
    cors: {
      origin: LOCAL_DEV_ORIGIN,
    },
  },
  preview: {
    host: "localhost",
    cors: {
      origin: LOCAL_DEV_ORIGIN,
    },
  },
};
