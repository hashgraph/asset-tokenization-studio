import jest from "eslint-plugin-jest";
import globals from "globals";

/** Jest test file overlay */
export default {
  files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.node,
    },
  },
  plugins: {
    jest,
  },
  rules: {
    ...jest.configs.recommended.rules,
    "@typescript-eslint/no-unused-expressions": "off",
  },
};
