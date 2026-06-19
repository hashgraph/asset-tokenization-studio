/**
 * Solhint configuration for ATS Contracts package
 * Extends root monorepo configuration
 * @see https://protofire.github.io/solhint/docs/rules.html
 */

module.exports = {
  extends: "solhint:recommended",
  // Custom ATS rules live in ./solhint-plugin-ats — the deterministic, AST-checkable slice of
  // the AUTOMATED conventions in ./conventions/*.md. Referenced below as "ats/<rule>".
  plugins: ["ats"],
  rules: {
    // ATS conventions (see ./conventions/*.md). Each rule's target severity is ERROR. Rules with
    // preexisting debt in the current codebase are temporarily "warn" (ratchet): they surface but
    // do not block, and flip to "error" once their debt is cleared. The count is the debt as of
    // the last full lint. Rules already clean (0 findings) are "error" now.

    // Clean → error
    "no-global-import": "error", // ATS-IMP-001
    "ats/no-direct-msg-sender": "error", // ATS-EVM-001
    "ats/no-direct-block-timestamp": "error", // ATS-EVM-002
    "ats/no-check-modifier": "error", // ATS-NAME-005
    "ats/no-erc3643-import": "error", // ATS-BOUND-001

    // Has debt → warn (ratchet to error once cleaned)
    "ats/storage-struct-erc7201": "warn", // ATS-STORAGE-001 (0; real tag added, reused layouts use the erc7201:multiple sentinel)
    "ats/storage-accessor-private": "warn", // ATS-PRIV-001 (0; rule now targets only the canonical zero-param storage accessor)
    "ats/storage-accessor-underscore": "warn", // ATS-NAME-006 (0; all private storage accessors now carry the leading _)
    "gas-custom-errors": "warn", // ATS-ERR-001 (4)
    "gas-increment-by-one": "warn", // ATS-GAS-001 (32)
    "interface-starts-with-i": "warn", // ATS-IFACE-001 (12, all vendored factory/ERC3643)
    "ats/function-param-underscore": "warn", // ATS-NAME-001 (80)
    "ats/named-return-underscore": "warn", // ATS-NAME-002 (10)
    "ats/event-param-no-underscore": "warn", // ATS-EVENT-002 (36)
    "gas-calldata-parameters": "warn", // ATS-FUNC-001 (built-in; replaced the custom ats/external-calldata-params, which only duplicated it)
    "ats/loop-unchecked-increment": "warn", // ATS-GAS-002 (14)
    // ATS-SUFFIX-001 — now MANUAL (rule removed): transitive inheritance of
    // IStaticFunctionSelectors is unresolvable in solhint. See conventions/architecture.md.
    "ats/no-solhint-disable": "off", // ATS-LINT-001 — temporarily disabled (TODO: re-enable to "warn")

    // Line length and formatting
    "max-line-length": ["error", 120],
    "max-states-count": ["off", 15],
    quotes: ["error", "double"], // Align with Prettier singleQuote: false

    // Code quality and safety
    "no-empty-blocks": "off",
    "no-unused-vars": "error",
    "payable-fallback": "error",
    "reason-string": ["error", { maxLength: 80 }],

    // Solidity syntax and style
    "constructor-syntax": "error",
    "const-name-snakecase": "error",
    "func-name-mixedcase": "error",
    "func-param-name-mixedcase": "error",
    "modifier-name-mixedcase": "error",
    "private-vars-leading-underscore": ["error", { strict: false }],
    "use-forbidden-name": "error",
    "var-name-mixedcase": "error",

    // Import and ordering rules
    "imports-on-top": "error",
    "visibility-modifier-order": "error",
    ordering: "error",

    // Security rules
    "avoid-call-value": "error",
    "avoid-sha3": "error",
    "avoid-suicide": "error",
    "avoid-throw": "error",
    "avoid-tx-origin": "error",
    "check-send-result": "error",
    "multiple-sends": "error",
    reentrancy: "error",
    "state-visibility": "error",

    // Compiler and function rules
    "compiler-version": ["error", ">=0.8.0 <0.9.0"],
    "func-visibility": ["warn", { ignoreConstructors: true }],

    // Time-related rules (disabled as commonly needed in DeFi)
    "not-rely-on-time": "off",

    // Indexed-event selection is governed by ATS-EVENT-010 (filtering keys only, not gas). The
    // built-in suggests indexing any fixed-size field for a marginal gas saving — rejected.
    "gas-indexed-events": "off",

    "use-natspec": "warn",

    // Rules driven to zero and locked as errors so they can never regress. The
    // remaining recommended warnings are governed by the betterer ratchet
    // (.betterer.ts / .betterer.results) instead — see the contracts lint scripts.
    "duplicated-imports": "error",
    "gas-increment-by-one": "error",
  },
};
