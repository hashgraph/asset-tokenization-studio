import globals from "globals";

/** Mocha/Hardhat test file overlay */
export default {
  files: ["test/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
  languageOptions: {
    globals: {
      ...globals.mocha,
      ...globals.node,
    },
  },
  rules: {
    "@typescript-eslint/no-unused-expressions": "off",
  },
};
