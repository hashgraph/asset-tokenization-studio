/**
 * ESLint configuration for ATS SDK package
 * Extends root monorepo configuration with SDK-specific rules
 */
import baseConfig from '../../../eslint.config.mjs';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

// Filter base config to get general rules and adapt paths for SDK
const sdkConfig = baseConfig
  .filter(
    (config) =>
      // Include base ignores, default config, but exclude package-specific rules
      !config.files || config.files.includes('**/*.{js,mjs,cjs,ts,tsx,mts}'),
  )
  .concat([
    // SDK files - adapted paths
    {
      files: ['**/*.ts', '**/*.mts'],
      plugins: {
        jest,
      },
      rules: {
        ...jest.configs.recommended.rules,
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },

    // SDK test files - additional test-specific overrides - adapted paths
    {
      files: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '__tests__/**/*.ts',
        '**/__tests__/**/*.ts',
        '**/jest-setup-file.ts',
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

    // SDK jest mock files (__mocks__ folders) - adapted paths
    {
      files: ['**/__mocks__/**/*.{js,ts,tsx}'],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.es2020,
          ...globals.jest,
        },
      },
    },
  ]);

export default sdkConfig;