const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "function-param-underscore";
const meta = {
  type: "naming",
  docs: {
    description: "Function parameter missing the `_` prefix (ATS-NAME-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

const CHECKED_VISIBILITY = new Set(["external", "public", "internal"]);

// ATS-NAME-001 — parameters of external/public/internal functions are prefixed with `_`.
// Scope: contracts/interfaces/abstracts only — `library …StorageWrapper` helpers follow a
// distinct no-underscore house style (see ATS-NAME-003). Exceptions: unnamed parameters,
// constructors/fallback/receive, and `override` functions (must keep the parent signature).
class FunctionParamUnderscoreChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ContractDefinition(node) {
    if (node.kind === "library") return;
    (node.subNodes || []).forEach((sub) => {
      if (sub.type !== "FunctionDefinition") return;
      if (sub.isConstructor || sub.isFallback || sub.isReceiveEther) return;
      if (sub.override) return;
      if (!CHECKED_VISIBILITY.has(sub.visibility)) return;
      (sub.parameters || []).forEach((param) => {
        if (param.name && !param.name.startsWith("_")) {
          this.error(param, `ATS-NAME-001: function parameter '${param.name}' must start with '_'.`);
        }
      });
    });
  }
}

module.exports = FunctionParamUnderscoreChecker;
