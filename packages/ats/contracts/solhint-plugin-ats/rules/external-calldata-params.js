const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "external-calldata-params";
const meta = {
  type: "gas-consumption",
  docs: {
    description: "`memory` parameter in an `external` function where `calldata` is possible (ATS-FUNC-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-FUNC-001 — reference-type parameters of `external` functions should be `calldata`, not
// `memory`. A storage location of `memory` only applies to reference types, so the check is the
// presence of `memory` on an external parameter.
class ExternalCalldataParamsChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  FunctionDefinition(node) {
    if (node.visibility !== "external") return;
    (node.parameters || []).forEach((param) => {
      if (param.storageLocation === "memory") {
        this.error(param, `ATS-FUNC-001: external parameter '${param.name || ""}' should be 'calldata', not 'memory'.`);
      }
    });
  }
}

module.exports = ExternalCalldataParamsChecker;
