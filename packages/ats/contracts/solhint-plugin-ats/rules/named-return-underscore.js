const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "named-return-underscore";
const meta = {
  type: "naming",
  docs: {
    description: "Named return variable missing the `_` suffix (ATS-NAME-002).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-NAME-002 — named return variables end with `_`. Scope: contracts/interfaces/abstracts only
// — `library …StorageWrapper` helpers follow the no-underscore house style (see ATS-NAME-003).
// Unnamed returns are fine; `override` functions are skipped (parent signature wins).
class NamedReturnUnderscoreChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ContractDefinition(node) {
    if (node.kind === "library") return;
    (node.subNodes || []).forEach((sub) => {
      if (sub.type !== "FunctionDefinition") return;
      if (sub.override) return;
      (sub.returnParameters || []).forEach((param) => {
        if (param.name && !param.name.endsWith("_")) {
          this.error(param, `ATS-NAME-002: named return '${param.name}' must end with '_'.`);
        }
      });
    });
  }
}

module.exports = NamedReturnUnderscoreChecker;
