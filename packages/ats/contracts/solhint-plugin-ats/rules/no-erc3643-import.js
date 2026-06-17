const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "no-erc3643-import";
const meta = {
  type: "best-practices",
  docs: {
    description: "Forbidden import from `factory/ERC3643/` in a neutral/shared module (ATS-BOUND-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-BOUND-001 — files under constants/, domain/, facets/layer_1-2/, or named Factory.sol must
// not depend on the T-REX side; they may not import from factory/ERC3643/.
class NoErc3643ImportChecker extends BaseChecker {
  constructor(reporter, config, inputSrc, fileName) {
    super(reporter, ruleId, meta);
    this.fileName = fileName || "";
  }

  ImportDirective(node) {
    const f = this.fileName;
    const guarded =
      /contracts\/constants\//.test(f) ||
      /contracts\/domain\//.test(f) ||
      /contracts\/facets\/layer_1-2\//.test(f) ||
      /Factory\.sol$/.test(f);
    if (!guarded) return;
    if (node.path && node.path.includes("factory/ERC3643/")) {
      this.error(node, "ATS-BOUND-001: forbidden import from factory/ERC3643/ in this module.");
    }
  }
}

module.exports = NoErc3643ImportChecker;
