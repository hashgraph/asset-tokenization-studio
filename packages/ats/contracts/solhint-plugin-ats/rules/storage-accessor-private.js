const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "storage-accessor-private";
const meta = {
  type: "best-practices",
  docs: {
    description: "StorageWrapper `*Storage()` accessor declared `internal` instead of `private` (ATS-PRIV-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-PRIV-001 — inside a `library …StorageWrapper`, the `*Storage()` accessor that returns the
// namespaced struct reference must be `private`, not `internal`.
class StorageAccessorPrivateChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ContractDefinition(node) {
    if (node.kind !== "library" || !node.name.endsWith("StorageWrapper")) return;
    (node.subNodes || []).forEach((sub) => {
      if (sub.type === "FunctionDefinition" && sub.name && /Storage$/.test(sub.name) && sub.visibility === "internal") {
        this.error(sub, `ATS-PRIV-001: StorageWrapper accessor '${sub.name}' must be 'private', not 'internal'.`);
      }
    });
  }
}

module.exports = StorageAccessorPrivateChecker;
