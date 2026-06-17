const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "no-direct-block-timestamp";
const meta = {
  type: "best-practices",
  docs: {
    description:
      "Direct use of `block.timestamp` instead of TimeTravelStorageWrapper.getBlockTimestamp() (ATS-EVM-002).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-EVM-002 — `block.timestamp` must be routed through
// `TimeTravelStorageWrapper.getBlockTimestamp()` everywhere except inside that wrapper itself.
class NoDirectBlockTimestampChecker extends BaseChecker {
  constructor(reporter, config, inputSrc, fileName) {
    super(reporter, ruleId, meta);
    this.fileName = fileName || "";
  }

  MemberAccess(node) {
    if (this.fileName.endsWith("TimeTravelStorageWrapper.sol")) return;
    if (node.expression && node.expression.name === "block" && node.memberName === "timestamp") {
      this.error(node, "ATS-EVM-002: use TimeTravelStorageWrapper.getBlockTimestamp() instead of block.timestamp.");
    }
  }
}

module.exports = NoDirectBlockTimestampChecker;
