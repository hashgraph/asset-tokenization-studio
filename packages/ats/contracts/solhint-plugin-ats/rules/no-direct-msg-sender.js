const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "no-direct-msg-sender";
const meta = {
  type: "best-practices",
  docs: {
    description: "Direct use of `msg.sender` instead of `EvmAccessors.getMsgSender()` (ATS-EVM-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-EVM-001 — `msg.sender` must be routed through `EvmAccessors.getMsgSender()` everywhere
// except inside `EvmAccessors.sol` itself. NatSpec mentions never reach the AST, so comments
// are safe by construction. solhint passes the file path as the 4th constructor argument.
class NoDirectMsgSenderChecker extends BaseChecker {
  constructor(reporter, config, inputSrc, fileName) {
    super(reporter, ruleId, meta);
    this.fileName = fileName || "";
  }

  MemberAccess(node) {
    if (this.fileName.endsWith("EvmAccessors.sol")) return;
    if (node.expression && node.expression.name === "msg" && node.memberName === "sender") {
      this.error(node, "ATS-EVM-001: use EvmAccessors.getMsgSender() instead of msg.sender.");
    }
  }
}

module.exports = NoDirectMsgSenderChecker;
