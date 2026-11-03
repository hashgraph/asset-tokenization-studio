const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "event-param-no-underscore";
const meta = {
  type: "naming",
  docs: {
    description: "Event parameter name starts with `_` (ATS-EVENT-002).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

// ATS-EVENT-002 — event parameters use clean names without a leading `_` (the ABI topic hash
// depends on types only, so the rename is non-breaking; follows the OpenZeppelin convention).
class EventParamNoUnderscoreChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  EventDefinition(node) {
    (node.parameters || []).forEach((param) => {
      if (param.name && param.name.startsWith("_")) {
        this.error(param, `ATS-EVENT-002: event parameter '${param.name}' must not start with '_'.`);
      }
    });
  }
}

module.exports = EventParamNoUnderscoreChecker;
