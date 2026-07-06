const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "storage-accessor-underscore";
const meta = {
  type: "naming",
  docs: {
    description: "Private StorageWrapper `*Storage()` accessor must start with `_` (ATS-NAME-006).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// A canonical namespaced-storage accessor: a `*Storage` function taking no parameters and
// returning a single `storage` reference (same shape used by storage-accessor-private.js).
function isCanonicalStorageAccessor(sub) {
  if (sub.type !== "FunctionDefinition" || !sub.name || !/Storage$/.test(sub.name)) return false;
  if ((sub.parameters || []).length !== 0) return false;
  return (sub.returnParameters || []).some((ret) => ret.storageLocation === "storage");
}

// ATS-NAME-006 — inside a `library …StorageWrapper`, the `private` `*Storage()` accessor is a
// hidden implementation detail and must carry a leading `_`, distinguishing it from the `internal`
// API (which carries none — see ATS-NAME-003). The check is scoped to `private` accessors: an
// `internal` one is governed by ATS-PRIV-001 (it should be `private`) and ATS-NAME-003 (no `_`).
class StorageAccessorUnderscoreChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ContractDefinition(node) {
    if (node.kind !== "library" || !node.name.endsWith("StorageWrapper")) return;
    (node.subNodes || []).forEach((sub) => {
      if (isCanonicalStorageAccessor(sub) && sub.visibility === "private" && !sub.name.startsWith("_")) {
        this.error(sub, `ATS-NAME-006: private StorageWrapper accessor '${sub.name}' must start with '_'.`);
      }
    });
  }
}

module.exports = StorageAccessorUnderscoreChecker;
