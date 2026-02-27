import createBaseConfig from "@hashgraph/eslint-config";
import reactPreset from "@hashgraph/eslint-config/react";
import jestPreset from "@hashgraph/eslint-config/jest";

export default [
  ...createBaseConfig(),

  // React/Browser environment
  reactPreset,

  // Jest test overlay
  jestPreset,

  // Frontend-specific overrides
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // Test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },

  // Mock files
  {
    files: ["**/mocks/**/*.{ts,tsx}", "**/__mocks__/**/*.{ts,tsx}", "**/test-utils/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // Deprecated code
  {
    files: ["**/deprecated/**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
