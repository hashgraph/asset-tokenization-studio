// SPDX-License-Identifier: Apache-2.0

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

function legacyPlugin(name, alias = name) {
  const plugin = compat.plugins(name)[0]?.plugins?.[alias];

  if (!plugin) {
    throw new Error(`Unable to resolve plugin ${name} and/or alias ${alias}`);
  }

  return fixupPluginRules(plugin);
}

export default [
  {
    ignores: ["**/.eslintrc.js", "src/migrations/*", "load-tests/*"],
  },
  ...fixupConfigRules(compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier")),
  {
    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "@stylistic/ts": stylisticTs,
      "unused-imports": unusedImports,
      import: legacyPlugin("eslint-plugin-import", "import"),
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "module",
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: ".",
      },
    },
    settings: {
      typescript: true,
      node: true,
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ".",
        },
      },
    },
    rules: {
      camelcase: "error",
      "no-multiple-empty-lines": [
        "error",
        {
          max: 1,
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": "warn",
      "@stylistic/ts/semi": ["error", "never"],
      "max-len": [
        "error",
        {
          code: 120,
          ignorePattern: "^import .*",
        },
      ],
      "@stylistic/ts/quotes": ["error", "double"],
      "@stylistic/ts/lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "src/domain/**",
              from: "src/application/**",
              message: "Domain cannot import from application layer",
            },
            {
              target: "src/domain/**",
              from: "src/infrastructure/**",
              message: "Domain cannot import from infrastructure layer",
            },
            {
              target: "src/application/**",
              from: "src/infrastructure/**",
              message: "Application cannot import from infrastructure layer",
            },
          ],
        },
      ],
    },
  },
];
