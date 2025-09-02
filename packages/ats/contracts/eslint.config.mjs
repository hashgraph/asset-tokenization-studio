/**
 * ESLint configuration for ATS Contracts package
 * Extends root monorepo configuration with contract-specific rules
 */
import baseConfig from '../../../eslint.config.mjs';
import globals from 'globals';

// Filter base config to get general rules and adapt paths for contracts
const contractsConfig = baseConfig
  .filter(
    (config) =>
      // Include base ignores, default config, but exclude package-specific rules
      !config.files || config.files.includes('**/*.{js,mjs,cjs,ts,tsx,mts}'),
  )
  .concat([
    // Contract-specific TypeScript files (non-test) - adapted paths
    {
      files: ['**/*.ts'],
      ignores: ['**/*.test.ts', '**/*.spec.ts', 'test/**/*'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'error',
      },
    },

    // Contract test files - adapted paths
    {
      files: [
        '**/*.test.ts',
        '**/*.spec.ts',
        'test/**/*.ts',
        '**/*.test.js',
        '**/*.spec.js',
        'test/**/*.js',
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
  ]);

export default contractsConfig;
