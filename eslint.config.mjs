import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  // Global ignores (generated code, build output, vendored files)
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/out/**",
      "**/coverage/**",
      "**/typechain-types/**",
      "**/artifacts/**",
      "**/cache/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/fixtures/**",
      "**/__mocks__/**",
      "**/*.config.{js,cjs,mjs}",
      "**/hardhat.config.ts",
      "**/*.d.ts",
      "**/tmp/**",
    ],
  },

  ...tseslint.configs.recommended,

  // Base rules for all TypeScript files (Node/Hardhat environment)
  {
    files: ["**/*.{ts,mts}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Disable base rules that TypeScript handles natively
      "no-unused-vars": "off",
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },

  prettierConfig,

  // Mocha/Chai test overlay
  {
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
  },

  // Non-test source files: enforce no unused expressions
  {
    files: ["**/*.ts"],
    ignores: ["**/*.test.ts", "**/*.spec.ts", "test/**/*"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "error",
    },
  },

  // The solhint plugin is CommonJS (solhint loads it via require(), so it cannot use ESM
  // imports). Keep linting it for real issues, but allow require()/CommonJS here.
  {
    files: ["solhint-plugin-ats/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
