import createBaseConfig from "@hashgraph/eslint-config";
import nodePreset from "@hashgraph/eslint-config/node";
import jestPreset from "@hashgraph/eslint-config/jest";
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

  // Jest test overlay
  jestPreset,

  // SDK-specific overrides
  {
    files: ["**/*.ts"],
    rules: {
      semi: "off",
      "@stylistic/ts/semi": "off",
      "unused-imports/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
