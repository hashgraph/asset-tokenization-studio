/**
 * Solhint configuration for ATS Contracts
 * @see https://protofire.github.io/solhint/docs/rules.html
 */

module.exports = {
  extends: "solhint:recommended",
  // Custom "ats/" rules live in ./solhint-plugin-ats and enforce ./conventions/*.md.
  plugins: ["ats"],
  rules: {
    // ATS conventions. Target severity is "error"; "warn" marks rules with pending debt.
    "no-global-import": "error", // ATS-IMP-001
    "ats/no-direct-msg-sender": "warn", // ATS-EVM-001
    "ats/no-direct-block-timestamp": "error", // ATS-EVM-002
    "ats/no-check-modifier": "error", // ATS-NAME-005
    "ats/storage-struct-erc7201": "warn", // ATS-STORAGE-001
    "ats/storage-accessor-private": "warn", // ATS-PRIV-001
    "ats/storage-accessor-underscore": "warn", // ATS-NAME-006
    "ats/function-param-underscore": "warn", // ATS-NAME-001
    "ats/named-return-underscore": "warn", // ATS-NAME-002
    "ats/event-param-no-underscore": "warn", // ATS-EVENT-002
    "ats/loop-unchecked-increment": "warn", // ATS-GAS-002
    "ats/no-solhint-disable": "off", // ATS-LINT-001 (manual review)
    "gas-custom-errors": "warn", // ATS-ERR-001
    "gas-calldata-parameters": "warn", // ATS-FUNC-001
    "interface-starts-with-i": "warn", // ATS-IFACE-001
    "gas-indexed-events": "off", // superseded by ATS-EVENT-010

    // Formatting
    "max-line-length": ["error", 120],
    "max-states-count": ["off", 15],
    quotes: ["error", "double"],

    // Code quality
    "no-empty-blocks": "off",
    "no-unused-vars": "error",
    "payable-fallback": "error",
    "reason-string": ["error", { maxLength: 80 }],
    "use-natspec": "warn",
    "duplicated-imports": "error",
    "gas-increment-by-one": "warn",

    // Naming and style
    "constructor-syntax": "error",
    "const-name-snakecase": "error",
    "func-name-mixedcase": "error",
    "func-param-name-mixedcase": "error",
    "modifier-name-mixedcase": "error",
    "private-vars-leading-underscore": ["error", { strict: false }],
    "use-forbidden-name": "error",
    "var-name-mixedcase": "error",

    // Imports and ordering
    "imports-on-top": "error",
    "visibility-modifier-order": "error",
    ordering: "error",

    // Security
    "avoid-call-value": "error",
    "avoid-sha3": "error",
    "avoid-suicide": "error",
    "avoid-throw": "error",
    "avoid-tx-origin": "error",
    "check-send-result": "error",
    "multiple-sends": "error",
    reentrancy: "error",
    "state-visibility": "error",

    // Compiler and functions
    "compiler-version": ["error", ">=0.8.0 <0.9.0"],
    "func-visibility": ["warn", { ignoreConstructors: true }],
    "not-rely-on-time": "off",
  },
};
