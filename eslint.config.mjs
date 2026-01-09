import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import jest from "eslint-plugin-jest";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  // Base configuration - ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/out/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/typechain-types/**",
      "**/artifacts/**",
      "**/cache/**",
      "**/Smart Contracts Audit Report.pdf",
      "**/*.sol-coverage",
      "**/gas-report.txt",
      "**/.env*",
      "**/*.pdf",
      "**/docs/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/fixtures/**",
      "**/__mocks__/**",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/*.config.mjs",
      "**/commitlint.config.ts",
      "**/jest.config.js",
      "**/hardhat.config.ts",
      "**/*.js",
      "**/*d.ts",
      "**/tmp/**",
      "**/example/**",
      "**/src_old/**",
      "**/package.json",
      // TODO: REMOVE mass-payout ignore lines
      //  Temporally ignore mass-payout related files
      "**/mass-payout/**",
      "apps/mass-payout/**",
      "packages/mass-payout/**",
    ],
  },

  // Default configuration for all JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier,
      "unused-imports": unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-var-requires": "off",
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },

  // Contract-specific TypeScript files (non-test)
  {
    files: ["packages/ats/contracts/**/*.ts"],
    ignores: ["**/*.test.ts", "**/*.spec.ts", "packages/ats/contracts/test/**/*"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "error",
    },
  },

  // Contract test files
  {
    files: [
      "packages/ats/contracts/**/*.test.ts",
      "packages/ats/contracts/**/*.spec.ts",
      "packages/ats/contracts/test/**/*.ts",
      "packages/ats/contracts/**/*.test.js",
      "packages/ats/contracts/**/*.spec.js",
      "packages/ats/contracts/test/**/*.js",
    ],
    languageOptions: {
      // Include mocha globals used by Hardhat tests (describe, it, before, after, etc.)
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.mocha,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },

  // SDK files
  {
    files: ["packages/ats/sdk/**/*.ts", "packages/ats/sdk/**/*.mts"],
    plugins: {
      jest,
    },
    rules: {
      ...jest.configs.recommended.rules,
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // SDK test files - additional test-specific overrides
  {
    files: [
      "packages/ats/sdk/**/*.test.ts",
      "packages/ats/sdk/**/*.spec.ts",
      "packages/ats/sdk/__tests__/**/*.ts",
      "packages/ats/sdk/**/__tests__/**/*.ts",
      "packages/ats/sdk/**/jest-setup-file.ts",
    ],
    languageOptions: {
      // Extend existing globals with Jest testing globals so describe/it/expect are defined
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // SDK jest mock files (__mocks__ folders)
  {
    files: ["packages/ats/sdk/**/__mocks__/**/*.{js,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.jest,
      },
    },
  },

  // React/Web app files
  {
    files: ["apps/ats/web/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },

  // Mass payout packages
  {
    files: [
      "apps/mass-payout/backend/**/*.test.ts",
      "apps/mass-payout/backend/**/*.spec.ts",
      "apps/mass-payout/backend/test/**/*.ts",
      "apps/mass-payout/backend/**/*.e2e.spec.ts",
      "apps/mass-payout/backend/**/e2e/**/*.ts",
      "packages/mass-payout/**/*.test.ts",
      "packages/mass-payout/**/*.spec.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
        ...globals.jest,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
      },
    },
    plugins: {
      jest,
    },
    rules: {
      ...jest.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-expressions": "off",
    },
  },

  // Mass payout frontend React files (non-test)
  {
    files: ["apps/mass-payout/frontend/**/*.{ts,tsx,js,jsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/__tests__/**/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },

  // Mass payout frontend test files
  {
    files: [
      "apps/mass-payout/frontend/**/*.test.ts",
      "apps/mass-payout/frontend/**/*.test.tsx",
      "apps/mass-payout/frontend/**/*.spec.ts",
      "apps/mass-payout/frontend/**/*.spec.tsx",
      "apps/mass-payout/frontend/**/__tests__/**/*.{ts,tsx,js,jsx}",
      "apps/mass-payout/frontend/src/**/__tests__/**/*.{ts,tsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        document: "readonly",
        window: "readonly",
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      jest,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-unused-expressions": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
];
