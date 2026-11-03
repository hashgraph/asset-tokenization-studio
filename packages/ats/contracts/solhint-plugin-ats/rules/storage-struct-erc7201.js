const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "storage-struct-erc7201";
const meta = {
  type: "best-practices",
  docs: {
    description: "Storage struct missing `@custom:storage-location erc7201:` annotation (ATS-STORAGE-001).",
    category: "ATS Conventions",
  },
  recommended: false,
  defaultSetup: "error",
  schema: null,
};

const ANNOTATION = "@custom:storage-location erc7201:";

// ATS-STORAGE-001 — a `…Storage` struct in a `*StorageWrapper.sol` must be immediately preceded
// by a NatSpec block carrying the ERC-7201 annotation. The annotation lives in a comment (not in
// the AST), so the preceding comment block is scanned in source.
class StorageStructErc7201Checker extends BaseChecker {
  constructor(reporter, config, inputSrc, fileName) {
    super(reporter, ruleId, meta);
    this.lines = (inputSrc || "").split("\n");
    this.fileName = fileName || "";
  }

  StructDefinition(node) {
    if (!/StorageWrapper\.sol$/.test(this.fileName)) return;
    if (!node.name || !/Storage$/.test(node.name)) return;
    const line = node.loc && node.loc.start && node.loc.start.line;
    if (!line) return;

    // Walk upward through the contiguous comment block directly above the struct.
    let i = line - 2; // zero-based index of the line above `struct …`
    let sawComment = false;
    while (i >= 0) {
      const t = this.lines[i].trim();
      if (t === "") {
        if (sawComment) break;
        i -= 1;
        continue;
      }
      const isComment = t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.endsWith("*/");
      if (!isComment) break; // reached code — comment block ended
      sawComment = true;
      if (t.includes(ANNOTATION)) return; // annotation found
      i -= 1;
    }

    this.error(
      node,
      `ATS-STORAGE-001: storage struct '${node.name}' must be preceded by NatSpec containing '${ANNOTATION}'.`,
    );
  }
}

module.exports = StorageStructErc7201Checker;
