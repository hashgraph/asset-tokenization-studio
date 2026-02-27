import stylisticTs from "@stylistic/eslint-plugin-ts";

/** Mass-payout stylistic rules (semi: never, quotes: double, camelcase, etc.) */
export default {
  plugins: {
    "@stylistic/ts": stylisticTs,
  },
  rules: {
    camelcase: "error",
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "max-len": ["error", { code: 120, ignorePattern: "^import .*" }],
    "@stylistic/ts/semi": ["error", "never"],
    "@stylistic/ts/quotes": ["error", "double"],
    "@stylistic/ts/lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
  },
};
