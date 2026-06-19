/**
 * solhint-plugin-ats — custom solhint rules for the ATS Solidity conventions.
 *
 * The conventions themselves live in `packages/ats/contracts/conventions/*.md` (the single
 * source of truth). Each rule here is the deterministic, AST-checkable slice of an `AUTOMATED`
 * convention rule, so `AUTOMATED` finally means "enforced by solhint" rather than "checkable in
 * principle". Manual-judgement rules stay in the `/ats-style-guide` review subagent.
 *
 * solhint loads this via `plugins: ['ats']` and expects an array of rule classes. Each rule is
 * referenced in config as `ats/<ruleId>`.
 */
module.exports = [
  require("./rules/no-direct-msg-sender"), // ATS-EVM-001
  require("./rules/no-direct-block-timestamp"), // ATS-EVM-002
  require("./rules/no-check-modifier"), // ATS-NAME-005
  require("./rules/function-param-underscore"), // ATS-NAME-001
  require("./rules/named-return-underscore"), // ATS-NAME-002
  require("./rules/event-param-no-underscore"), // ATS-EVENT-002
  require("./rules/storage-accessor-private"), // ATS-PRIV-001
  require("./rules/storage-accessor-underscore"), // ATS-NAME-006
  require("./rules/storage-struct-erc7201"), // ATS-STORAGE-001
  require("./rules/no-erc3643-import"), // ATS-BOUND-001
  require("./rules/loop-unchecked-increment"), // ATS-GAS-002
  require("./rules/no-solhint-disable"), // ATS-LINT-001
];
