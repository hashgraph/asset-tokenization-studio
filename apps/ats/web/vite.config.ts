// SPDX-License-Identifier: Apache-2.0

import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// yarn add --dev @esbuild-plugins/node-modules-polyfill
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill"; // Temporarily disabled
// You don't need to add this to deps, it's included by @esbuild-plugins/node-modules-polyfill
import commonjs from "@rollup/plugin-commonjs";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import EnvironmentPlugin from "vite-plugin-environment";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import { nodePolyfills } from "vite-plugin-node-polyfills";

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
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
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
