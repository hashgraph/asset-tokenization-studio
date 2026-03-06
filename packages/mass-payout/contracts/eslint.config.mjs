import createBaseConfig from "@hashgraph/eslint-config";
import nodePreset from "@hashgraph/eslint-config/node";
import mochaPreset from "@hashgraph/eslint-config/mocha";
import stylisticPreset from "@hashgraph/eslint-config/stylistic";
import createDddConfig from "@hashgraph/eslint-config/ddd";

export default [
  ...createBaseConfig(),

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

  // Mocha test overlay
  mochaPreset,

  // Contracts-specific overrides
  {
    files: ["**/*.ts"],
    rules: {
      semi: "off",
      "@stylistic/ts/semi": "off",
      // Solidity-generated identifiers use non-camelCase names
      camelcase: "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
