/**
 * ESLint configuration for Mass Payout package
 * Extends root monorepo configuration with mass-payout-specific rules
 */
import baseConfig from '../../eslint.config.mjs';

// Filter base config to get general rules and adapt paths for mass-payout
const massPayoutConfig = baseConfig
  .filter(
    (config) =>
      // Include base ignores, default config, but exclude package-specific rules
      !config.files || config.files.includes('**/*.{js,mjs,cjs,ts,tsx,mts}'),
  )
  .concat([
    // Mass-payout specific files - adapted paths
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        // Add any mass-payout specific rules here if needed in the future
      },
    },
  ]);

export default massPayoutConfig;
