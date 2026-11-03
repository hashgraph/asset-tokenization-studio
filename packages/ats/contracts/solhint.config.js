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

    // Has debt → warn (ratchet to error once cleaned). The live debt counts are owned by the
    // betterer ratchet (.betterer.ts / .betterer.results) — not duplicated here, to avoid drift.
    "ats/storage-struct-erc7201": "warn", // ATS-STORAGE-001
    "ats/storage-accessor-private": "warn", // ATS-PRIV-001
    "ats/storage-accessor-underscore": "warn", // ATS-NAME-006
    "gas-custom-errors": "warn", // ATS-ERR-001
    "interface-starts-with-i": "warn", // ATS-IFACE-001 (vendored factory interfaces)
    "ats/function-param-underscore": "warn", // ATS-NAME-001
    "ats/named-return-underscore": "warn", // ATS-NAME-002
    "ats/event-param-no-underscore": "warn", // ATS-EVENT-002
    "gas-calldata-parameters": "warn", // ATS-FUNC-001 (built-in; replaced the custom ats/external-calldata-params, which only duplicated it)
    "ats/loop-unchecked-increment": "warn", // ATS-GAS-002
    // ATS-SUFFIX-001 — now MANUAL (rule removed): transitive inheritance of
    // IStaticFunctionSelectors is unresolvable in solhint. See conventions/architecture.md.
    // ATS-LINT-001 — MANUAL for now (rule kept off): the codebase has sanctioned solhint-disable
    // blocks (e.g. uppercase ABI function names) the rule cannot yet distinguish. Teach it that
    // exception before enabling. Reviewed via the /ats-style-guide subagent meanwhile.
    "ats/no-solhint-disable": "off",

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

    "duplicated-imports": "error",
    "gas-increment-by-one": "error",
  },
};
