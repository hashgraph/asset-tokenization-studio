# Prettier Flat Config Clarification and Migration Notes

## Does Prettier have a flat config version?

No. Prettier does not currently support an ESLint-style flat config. It still uses its established configuration file formats:

- .prettierrc (JSON)
- .prettierrc.json (JSON)
- .prettierrc.yml / .prettierrc.yaml (YAML)
- .prettierrc.js / .prettierrc.cjs (CommonJS)
- .prettierrc.mjs (ES Module)
- prettier.config.js / prettier.config.cjs (CommonJS)
- prettier.config.mjs (ES Module)

For consistency with an ESLint flat config in ESM, using `prettier.config.mjs` is recommended.

---

## Root Prettier Config (ES Module)

Example configuration placed at `prettier.config.mjs`:

```js
/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier').Config}
 */
const config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.sol',
      options: {
        tabWidth: 4,
        printWidth: 120,
        singleQuote: true,
        semi: false,
        compiler: '0.8.18',
      },
    },
    {
      files: ['*.ts', '*.tsx', '*.mts'],
      options: { parser: 'typescript' },
    },
    {
      files: ['*.js', '*.jsx', '*.mjs', '*.cjs'],
      options: { parser: 'babel' },
    },
    { files: ['*.json'], options: { parser: 'json' } },
    { files: ['*.md'], options: { parser: 'markdown' } },
    { files: ['*.yml', '*.yaml'], options: { parser: 'yaml' } },
  ],
  plugins: ['prettier-plugin-solidity'],
};
export default config;
```

---

## .prettierignore (Root)

Typical ignore patterns:

```
node_modules
package-lock.json
yarn.lock
pnpm-lock.yaml
build
dist
out
coverage
.turbo
typechain-types
artifacts
cache
*.sol-coverage
gas-report.txt
.vscode
.idea
.env*
Smart Contracts Audit Report.pdf
```

---

## Centralized Script Approach (package.json excerpt)

Key scripts (example):

```
"lint": "npm run lint:js && npm run lint:sol",
"lint:js": "eslint . --cache",
"lint:sol": "solhint 'packages/ats/contracts/contracts/**/*.sol'",
"lint:fix": "eslint . --fix && npm run format",
"format": "prettier --write . --cache",
"format:check": "prettier --check . --cache"
```

Optional workspace convenience scripts can call the root scripts per package if desired.

---

## Lint-Staged (Simplified Example)

```
{
  "*.sol": ["prettier --write", "solhint"],
  "*.{js,mjs,cjs,ts,tsx,mts}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

---

## Removal of Per-Package Config

Old ESLint / Prettier configuration files in individual packages were removed in favor of the root configuration. Solidity-specific `.solhint.json` and `.solhintignore` remain in the contracts package.

---

## Benefits

- Single source of truth
- Reduced maintenance
- Consistent formatting and linting standards
- Fewer duplicate devDependencies
- Better performance via shared cache and ignore files
- Modern ESLint flat config usage

---

## Developer Notes

- Run linting from root: `npm run lint`
- Format code: `npm run format`
- Pre-commit hooks (if using husky + lint-staged) rely on the centralized config
- Ensure IDE uses the workspace versions of ESLint and Prettier

---

## Recommended Verification Steps

```
npm install
npm run lint
npm run format
npm run ats:build
```
