const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "facet-implements-selectors";
const meta = {
  type: "best-practices",
  docs: {
    description: "`XxxFacet` contract does not inherit `IStaticFunctionSelectors` (ATS-SUFFIX-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-SUFFIX-001 — a concrete `…Facet` contract must inherit `IStaticFunctionSelectors` so the
// Diamond can register its selectors.
class FacetImplementsSelectorsChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ContractDefinition(node) {
    if (node.kind !== "contract" || !node.name.endsWith("Facet")) return;
    const bases = (node.baseContracts || []).map((b) => b.baseName && b.baseName.namePath);
    if (!bases.includes("IStaticFunctionSelectors")) {
      this.error(node, `ATS-SUFFIX-001: contract '${node.name}' must inherit IStaticFunctionSelectors.`);
    }
  }
}

module.exports = FacetImplementsSelectorsChecker;
