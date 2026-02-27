/**
 * Root ESLint configuration.
 * Each package has its own eslint.config.mjs that extends @hashgraph/eslint-config.
 * This root config only handles root-level files and delegates to packages.
 */
export default [
  {
    // Each package handles its own linting via workspace scripts.
    // Ignore all package/app directories at root level.
    ignores: ["packages/**", "apps/**", "node_modules/**", "docs/**"],
  },
];
