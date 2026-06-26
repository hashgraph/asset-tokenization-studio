const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "no-direct-block-timestamp";
const meta = {
  type: "best-practices",
  docs: {
    description: "Direct use of `block.timestamp` instead of EvmAccessors.getBlockTimestamp() (ATS-EVM-002).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-EVM-002 — `block.timestamp` must be routed through `EvmAccessors.getBlockTimestamp()`
// everywhere except inside `EvmAccessors.sol` itself (which defines the accessor).
class NoDirectBlockTimestampChecker extends BaseChecker {
  constructor(reporter, config, inputSrc, fileName) {
    super(reporter, ruleId, meta);
    this.fileName = fileName || "";
  }

  MemberAccess(node) {
    if (this.fileName.split(/[\\/]/).pop() === "EvmAccessors.sol") return;
    if (node.expression && node.expression.name === "block" && node.memberName === "timestamp") {
      this.error(node, "ATS-EVM-002: use EvmAccessors.getBlockTimestamp() instead of block.timestamp.");
    }
  }
}

module.exports = NoDirectBlockTimestampChecker;
