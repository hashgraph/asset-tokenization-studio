/**
 * Prettier configuration for ATS Contracts
 * (formerly inherited from the monorepo root config — now inlined)
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",

  plugins: ["prettier-plugin-solidity"],

  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
        printWidth: 120,
        singleQuote: false,
        semi: true,
        compiler: "0.8.28",
      },
    },
    {
      files: ["*.ts", "*.tsx", "*.mts"],
      options: {
        parser: "typescript",
      },
    },
    {
      files: ["*.js", "*.jsx", "*.mjs", "*.cjs"],
      options: {
        parser: "babel",
      },
    },
    {
      files: ["*.json"],
      options: {
        parser: "json",
      },
    },
    {
      files: ["*.md"],
      options: {
        parser: "markdown",
      },
    },
    {
      files: ["*.yml", "*.yaml"],
      options: {
        parser: "yaml",
      },
    },
  ],
};

export default config;
