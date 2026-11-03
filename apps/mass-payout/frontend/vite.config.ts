// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { compression } from "vite-plugin-compression2";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// Origins allowed to make cross-origin requests to the local dev/preview server.
const LOCAL_DEV_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

export default defineConfig({
  plugins: [react(), tsconfigPaths(), compression()],
  assetsInclude: ["**/*.otf", "**/*.ttf"],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom"],
          "chakra-core": ["@chakra-ui/react"],
          "chakra-emotion": ["@emotion/react"],
          "chakra-motion": ["framer-motion"],
          query: ["@tanstack/react-query"],
          forms: ["react-hook-form", "zod"],
          i18n: ["i18next", "react-i18next"],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      output: {
        comments: false,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@chakra-ui/react", "@emotion/react", "framer-motion"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    // Bind to loopback only (pass `--host` explicitly when LAN access is really needed).
    host: "localhost",
    // Only pages served from this machine may read dev-server responses cross-origin;
    // Vite 5.2 otherwise answers any origin, so another site open in the browser could read the source.
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
});
