// SPDX-License-Identifier: Apache-2.0

import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import commonjs from "@rollup/plugin-commonjs";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import EnvironmentPlugin from "vite-plugin-environment";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      include: ["buffer", "process", "util", "stream", "crypto", "os", "vm", "path"],
      exclude: ["http", "https", "url", "querystring", "path", "fs"],
    }),
  ],
  define: {
    ...(process.env.NODE_ENV === "development" ? { global: "globalThis" } : {}),
  },
  resolve: {
    alias: {
      events: path.resolve(__dirname, "../../../node_modules/events/events.js"),
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
    ],
    exclude: ["winston", "winston-daily-rotate-file", "winston-transport"],
    esbuildOptions: {
      define: {
        global: "globalThis",
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
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
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
  },
};
