import createBaseConfig from "@hashgraph/eslint-config";
import nodePreset from "@hashgraph/eslint-config/node";
import jestPreset from "@hashgraph/eslint-config/jest";
import stylisticPreset from "@hashgraph/eslint-config/stylistic";
import createDddConfig from "@hashgraph/eslint-config/ddd";
export default [
  ...createBaseConfig(),

  // Extra ignores
  {
    ignores: ["src/migrations/*", "load-tests/*", "babel.config.mjs"],
  },

  // Node environment
  {
    files: ["**/*.ts"],
    ...nodePreset,
  },

  // Stylistic rules (mass-payout conventions)
  {
    files: ["**/*.ts"],
    ...stylisticPreset,
  },

  // DDD layer enforcement
  {
    files: ["**/*.ts"],
    ...createDddConfig(),
  },

  // Jest test overlay with relaxed rules for backend
  {
    ...jestPreset,
    files: ["**/*.spec.ts", "**/*.test.ts", "**/test/**/*.ts", "**/e2e/**/*.ts"],
    rules: {
      ...jestPreset.rules,
      "jest/valid-title": "off",
      "jest/no-conditional-expect": "warn",
    },
  },

  // Backend-specific overrides
  {
    files: ["**/*.ts"],
    rules: {
      // Let prettier handle semicolons (root config: semi: true)
      semi: "off",
      "@stylistic/ts/semi": "off",
      "unused-imports/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
