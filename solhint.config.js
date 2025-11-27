/**
 * Root Solhint configuration for Asset Tokenization Studio monorepo
 * This base configuration can be extended by package-specific configs
 * @see https://protofire.github.io/solhint/docs/rules.html
 */

module.exports = {
  extends: 'solhint:recommended',
  rules: {
    // Line length and formatting
    'max-line-length': ['error', 120],
    'max-states-count': ['off', 15],
    quotes: ['error', 'double'], // Align with Prettier singleQuote: false

    // Code quality and safety
    'no-empty-blocks': 'error',
    'no-unused-vars': 'error',
    'payable-fallback': 'error',
    'reason-string': ['error', { maxLength: 80 }],

    // Solidity syntax and style
    'constructor-syntax': 'error',
    'const-name-snakecase': 'error',
    'func-name-mixedcase': 'error',
    'func-param-name-mixedcase': 'error',
    'modifier-name-mixedcase': 'error',
    'private-vars-leading-underscore': ['error', { strict: false }],
    'use-forbidden-name': 'error',
    'var-name-mixedcase': 'error',

    // Import and ordering rules
    'imports-on-top': 'error',
    'visibility-modifier-order': 'error',
    ordering: 'error',

    // Security rules
    'avoid-call-value': 'error',
    'avoid-sha3': 'error',
    'avoid-suicide': 'error',
    'avoid-throw': 'error',
    'avoid-tx-origin': 'error',
    'check-send-result': 'error',
    'multiple-sends': 'error',
    reentrancy: 'error',
    'state-visibility': 'error',

    // Compiler and function rules
    'compiler-version': ['error', '>=0.8.0 <0.9.0'],
    'func-visibility': ['warn', { ignoreConstructors: true }],

    // Time-related rules (disabled as commonly needed in DeFi)
    'not-rely-on-time': 'off',

    // Disable verbose documentation warnings to focus on code quality
    'use-natspec': 'off',
  },
};
