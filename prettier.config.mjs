/**
 * Root Prettier configuration for Asset Tokenization Studio monorepo
 * This base configuration can be extended by package-specific configs
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const baseConfig = {
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

  // Include Solidity plugin for global formatting scripts
  plugins: ["prettier-plugin-solidity"],

  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
        printWidth: 120,
        singleQuote: false,
        semi: true,
        compiler: "0.8.18",
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

export default baseConfig;
