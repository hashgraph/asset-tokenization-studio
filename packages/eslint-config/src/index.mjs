import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

/**
 * Common ignores shared across all packages.
 */
export const baseIgnores = {
  ignores: [
    "**/node_modules/**",
    "**/build/**",
    "**/dist/**",
    "**/out/**",
    "**/coverage/**",
    "**/.turbo/**",
    "**/typechain-types/**",
    "**/artifacts/**",
    "**/cache/**",
    "**/*.pdf",
    "**/.vscode/**",
    "**/.idea/**",
    "**/fixtures/**",
    "**/__mocks__/**",
    "**/*.config.{js,cjs,mjs}",
    "**/jest.config.*",
    "**/hardhat.config.ts",
    "**/commitlint.config.ts",
    "**/*.js",
    "**/*d.ts",
    "**/tmp/**",
    "**/example/**",
  ],
};

/**
 * Base rules applied to all TypeScript files.
 */
export const baseRules = {
  files: ["**/*.{ts,tsx,mts}"],
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    globals: {
      ...globals.es2020,
    },
  },
  plugins: {
    "unused-imports": unusedImports,
    prettier,
  },
  rules: {
    ...js.configs.recommended.rules,
    // Disable base rules that TypeScript handles natively
    "no-unused-vars": "off",
    "no-undef": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-var-requires": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },
};

/**
 * Creates the base ESLint flat config array.
 * Includes: ignores, typescript-eslint recommended, and base rules.
 */
export default function createBaseConfig() {
  return [baseIgnores, ...tseslint.configs.recommended, baseRules];
}
