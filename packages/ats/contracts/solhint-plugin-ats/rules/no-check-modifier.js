const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "no-check-modifier";
const meta = {
  type: "naming",
  docs: {
    description: "Modifier name prefixed with `check`, reserved for `_check*` helpers (ATS-NAME-005).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-NAME-005 — `check` is a verb reserved for the `_check*` assertion helpers a modifier
// delegates to; a modifier must be named for the guaranteed property (`only*`/`not*`). This
// supersedes the interim grep in the skill's check-solhint.sh hook.
class NoCheckModifierChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ModifierDefinition(node) {
    if (/^check/.test(node.name)) {
      this.error(
        node,
        `ATS-NAME-005: modifier '${node.name}' must not start with 'check'; rename to 'only*'/'not*' and keep 'check' on the '_check*' helper.`,
      );
    }
  }
}

module.exports = NoCheckModifierChecker;
