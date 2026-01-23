// SPDX-License-Identifier: Apache-2.0

/**
 * Type definitions for Vite environment variables
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
