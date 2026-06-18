import createBaseConfig from "@hashgraph/eslint-config";
import nodePreset from "@hashgraph/eslint-config/node";
import mochaPreset from "@hashgraph/eslint-config/mocha";

export default [
  ...createBaseConfig(),

  // Global ignores for generated files and the CommonJS solhint plugin (loaded via require()
  // by solhint, so it cannot use ESM imports — exempt from the TS/ESM lint rules).
  {
    ignores: ["typechain-types/**/*", "build/**/*", "solhint-plugin-ats/**/*"],
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
];
