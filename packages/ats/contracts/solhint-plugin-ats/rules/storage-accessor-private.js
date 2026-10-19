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

// Identifies the canonical namespaced-storage accessor: a `*Storage` function that takes no
// parameters (it resolves a fixed ERC-7201 slot) and returns a single `storage` reference. This
// excludes two legitimately-`internal` shapes that merely share the `Storage` suffix:
//   - initialisers (e.g. `initFooStorage(...)`) — they take parameters and return nothing;
//   - slot-parameterised accessors (e.g. `fooStorage(bytes32 _position)`) — they take a slot and
//     are reused across namespaces, so they must stay `internal` to be callable cross-library.
function isCanonicalStorageAccessor(sub) {
  if (sub.type !== "FunctionDefinition" || !sub.name || !/Storage$/.test(sub.name)) return false;
  if ((sub.parameters || []).length !== 0) return false;
  return (sub.returnParameters || []).some((ret) => ret.storageLocation === "storage");
}

// ATS-PRIV-001 — inside a `library …StorageWrapper`, the canonical `*Storage()` accessor that
// returns the namespaced struct reference must be `private`, not `internal`.
class StorageAccessorPrivateChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ContractDefinition(node) {
    if (node.kind !== "library" || !node.name.endsWith("StorageWrapper")) return;
    (node.subNodes || []).forEach((sub) => {
      if (isCanonicalStorageAccessor(sub) && sub.visibility === "internal") {
        this.error(sub, `ATS-PRIV-001: StorageWrapper accessor '${sub.name}' must be 'private', not 'internal'.`);
      }
    });
  }
}

module.exports = StorageAccessorPrivateChecker;
