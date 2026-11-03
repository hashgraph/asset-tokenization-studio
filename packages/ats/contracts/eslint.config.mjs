import createBaseConfig from "@hashgraph/eslint-config";
import nodePreset from "@hashgraph/eslint-config/node";
import mochaPreset from "@hashgraph/eslint-config/mocha";

export default [
  ...createBaseConfig(),

  // Global ignores for generated files
  {
    ignores: ["typechain-types/**/*", "build/**/*"],
  },

  // All TS files run in Node (Hardhat)
  {
    files: ["**/*.ts"],
    ignores: ["typechain-types/**/*", "build/**/*"],
    ...nodePreset,
  },

  // Mocha/Chai test overlay
  mochaPreset,

  // Non-test source files: enforce no unused expressions
  {
    files: ["**/*.ts"],
    ignores: ["**/*.test.ts", "**/*.spec.ts", "test/**/*", "typechain-types/**/*", "build/**/*"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "error",
    },
  },

  // The solhint plugin is CommonJS (solhint loads it via require(), so it cannot use ESM
  // imports). Keep linting it for real issues, but allow require()/CommonJS here.
  {
    files: ["solhint-plugin-ats/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
