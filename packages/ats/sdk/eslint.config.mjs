import createBaseConfig from "@hashgraph/eslint-config";
import nodePreset from "@hashgraph/eslint-config/node";
import jestPreset from "@hashgraph/eslint-config/jest";

export default [
  ...createBaseConfig(),

  // All files run in Node
  {
    files: ["**/*.{ts,mts}"],
    ...nodePreset,
  },

  // Jest test overlay
  jestPreset,

  // SDK source: require explicit return types
  {
    files: ["**/*.{ts,mts}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Test files: relax return type requirement
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**/*.ts", "**/jest-setup-file.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];
