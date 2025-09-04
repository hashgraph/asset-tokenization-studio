import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import jest from 'eslint-plugin-jest';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  // Base configuration - ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/out/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/typechain-types/**',
      '**/artifacts/**',
      '**/cache/**',
      '**/Smart Contracts Audit Report.pdf',
      '**/*.sol-coverage',
      '**/gas-report.txt',
      '**/.env*',
      '**/*.pdf',
      '**/docs/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/fixtures/**',
      '**/__mocks__/**',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/commitlint.config.ts',
      '**/jest.config.js',
      '**/hardhat.config.ts',
      '**/build/**/*.js',
      '**/dist/**/*.js',
      '**/*d.ts',
      '**/tmp/**',
      '**/example/**',
      '**/src_old/**',
      '**/package.json',
    ],
  },

  // Default configuration for all JS/TS files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
      'unused-imports': unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-var-requires': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },

  // Contract-specific TypeScript files (non-test)
  {
    files: ['packages/ats/contracts/**/*.ts'],
    ignores: [
      '**/*.test.ts',
      '**/*.spec.ts',
      'packages/ats/contracts/test/**/*',
    ],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'error',
    },
  },

  // Contract test files
  {
    files: [
      'packages/ats/contracts/**/*.test.ts',
      'packages/ats/contracts/**/*.spec.ts',
      'packages/ats/contracts/test/**/*.ts',
      'packages/ats/contracts/**/*.test.js',
      'packages/ats/contracts/**/*.spec.js',
      'packages/ats/contracts/test/**/*.js',
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
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },

  // SDK files
  {
    files: ['packages/ats/sdk/**/*.ts', 'packages/ats/sdk/**/*.mts'],
    plugins: {
      jest,
    },
    rules: {
      ...jest.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // SDK test files - additional test-specific overrides
  {
    files: [
      'packages/ats/sdk/**/*.test.ts',
      'packages/ats/sdk/**/*.spec.ts',
      'packages/ats/sdk/__tests__/**/*.ts',
      'packages/ats/sdk/**/__tests__/**/*.ts',
      'packages/ats/sdk/**/jest-setup-file.ts',
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
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // SDK jest mock files (__mocks__ folders)
  {
    files: ['packages/ats/sdk/**/__mocks__/**/*.{js,ts,tsx}'],
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
    files: ['apps/ats/web/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  // Mass payout packages (if they exist)
  {
    files: [
      'packages/mass-payout/**/*.{ts,tsx}',
      'apps/mass-payout/**/*.{ts,tsx}',
    ],
    rules: {
      // Add any mass-payout specific rules here if needed
    },
  },
];
