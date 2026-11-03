const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "no-solhint-disable";
const meta = {
  type: "best-practices",
  docs: {
    description: "`solhint-disable` directive present — flag for review (ATS-LINT-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "warn",
  schema: null,
};

// ATS-LINT-001 (WARNING, always flag) — `solhint-disable` directives are a smell with very few
// legitimate uses. Scanned in raw source so the directive is seen regardless of how solhint
// itself consumes it.
class NoSolhintDisableChecker extends BaseChecker {
  constructor(reporter, config, inputSrc) {
    super(reporter, ruleId, meta);
    this.lines = (inputSrc || "").split("\n");
  }

  SourceUnit() {
    this.lines.forEach((line, idx) => {
      const col = line.indexOf("solhint-disable");
      if (col >= 0) {
        this.warn(
          { loc: { start: { line: idx + 1, column: col } } },
          "ATS-LINT-001: solhint-disable directive present — confirm it is one of the few accepted cases.",
        );
      }
    });
  }
}

module.exports = NoSolhintDisableChecker;
