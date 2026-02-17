import createBaseConfig from "@hashgraph/eslint-config";
import nodePreset from "@hashgraph/eslint-config/node";
import mochaPreset from "@hashgraph/eslint-config/mocha";

export default [
  ...createBaseConfig(),

  // All TS files run in Node (Hardhat)
  {
    files: ["**/*.ts"],
    ...nodePreset,
  },

  // Mocha/Chai test overlay
  mochaPreset,

  // Non-test source files: enforce no unused expressions
  {
    files: ["**/*.ts"],
    ignores: ["**/*.test.ts", "**/*.spec.ts", "test/**/*"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "error",
    },
  },
];
