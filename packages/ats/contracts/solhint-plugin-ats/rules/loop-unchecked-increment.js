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

// Recursively collect every ForStatement node reachable from `node` into `acc`.
// A generic walk over own object/array properties keeps this independent of the
// exact AST shape of each statement type.
function collectForStatements(node, acc) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) collectForStatements(child, acc);
    return;
  }
  if (node.type === "ForStatement") acc.add(node);
  for (const key of Object.keys(node)) {
    if (key === "type") continue;
    collectForStatements(node[key], acc);
  }
}

// ATS-GAS-002 — the counter increment must live in `unchecked { ++i; }` at the end of the body,
// leaving the for-header increment slot empty. Flags a for-loop whose loopExpression is a `++`/
// `--` of the counter.
//
// Exemption: a for-loop lexically inside an `unchecked { ... }` block is NOT flagged. `unchecked`
// is a lexical scope, so the header increment of an enclosed for-loop is already unchecked — the
// gas optimisation this rule exists for is already in place and rewriting it to the
// `unchecked { ++i; }` form would not save any gas. Because solhint visits the AST pre-order, the
// enclosing UncheckedStatement is always seen before its nested ForStatement(s), so the set is
// populated by the time the ForStatement handler runs.
class LoopUncheckedIncrementChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
    this.forsInsideUnchecked = new Set();
  }

  UncheckedStatement(node) {
    collectForStatements(node, this.forsInsideUnchecked);
  }

  ForStatement(node) {
    // Already inside an `unchecked` block → header increment is unchecked → nothing to optimise.
    if (this.forsInsideUnchecked.has(node)) return;

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
