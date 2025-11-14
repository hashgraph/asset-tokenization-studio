/**
 * ESLint configuration for ATS Contracts package
 * Extends root configuration with Hardhat/Mocha-specific overrides
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */
import rootConfig from "../../../eslint.config.mjs";
import globals from "globals";

export default [
  ...rootConfig,

  // Hardhat/Mocha test files - add test globals and relax rules
  {
    files: ["test/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...globals.mocha, // describe, it, before, after, beforeEach, afterEach
      },
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off", // Chai assertions use expressions
    },
  },
];
