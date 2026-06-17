const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "loop-unchecked-increment";
const meta = {
  type: "gas-consumption",
  docs: {
    description: "for-loop increments its counter in the header instead of an `unchecked` block (ATS-GAS-002).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-GAS-002 — the counter increment must live in `unchecked { ++i; }` at the end of the body,
// leaving the for-header increment slot empty. Flags a for-loop whose loopExpression is a `++`/
// `--` of the counter.
class LoopUncheckedIncrementChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  ForStatement(node) {
    const loop = node.loopExpression;
    if (!loop) return;
    const expr = loop.expression || loop;
    if (expr && expr.type === "UnaryOperation" && (expr.operator === "++" || expr.operator === "--")) {
      this.error(
        node,
        "ATS-GAS-002: move the counter increment to 'unchecked { ++i; }' and leave the for-header increment empty.",
      );
    }
  }
}

module.exports = LoopUncheckedIncrementChecker;
