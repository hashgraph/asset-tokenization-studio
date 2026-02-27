import createBaseConfig from "@hashgraph/eslint-config";
import reactPreset from "@hashgraph/eslint-config/react";
import jestPreset from "@hashgraph/eslint-config/jest";

export default [
  ...createBaseConfig(),

  // React/Browser environment
  reactPreset,

  // Jest test overlay
  jestPreset,

  // Web app overrides
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];
