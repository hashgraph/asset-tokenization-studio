#!/usr/bin/env node
// Generates packages/ats/contracts/FACETS_METHODS.md: a reference of every external/public
// entry point declared by the facet interfaces under contracts/facets/**, with full input
// parameters, return values, and any referenced struct/enum types.
//
// Usage (from packages/ats/contracts):
//   node ../../../.claude/skills/solidity-natspec/scripts/gen_facets_methods.mjs
//
// The script is the deterministic engine behind the FACETS_METHODS.md upkeep described in the
// solidity-natspec SKILL.md. It parses ASTs (not regex) so multi-line signatures and wrapped
// parameter lists are handled correctly.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve @solidity-parser/parser from the monorepo root node_modules.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const parserCandidates = [
  "node_modules/@solidity-parser/parser/dist/index.cjs.js",
  "node_modules/@solidity-parser/parser/dist/index.cjs",
  "packages/ats/contracts/node_modules/@solidity-parser/parser/dist/index.cjs.js",
];
const parserPath = parserCandidates.map((p) => path.join(repoRoot, p)).find((p) => fs.existsSync(p));
if (!parserPath) throw new Error("@solidity-parser/parser not found in node_modules");
const parserMod = await import(parserPath);
const parser = parserMod.default ?? parserMod;

const contractsRoot = path.join(repoRoot, "packages/ats/contracts");
const facetsDir = path.join(contractsRoot, "contracts/facets");

// ---------------------------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------------------------
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".sol")) out.push(full);
  }
  return out;
}

const allSolFiles = walk(path.join(contractsRoot, "contracts"));
// Interface convention in this repo: `I<PascalName>` — the char after the leading `I` is
// upper-case or a digit. This excludes concrete contracts that merely start with I
// (Identity.sol, Initializer.sol, InterestRate.sol, and their *Facet.sol variants).
const interfaceFiles = walk(facetsDir).filter((f) => /^I[A-Z0-9]/.test(path.basename(f)));

// ---------------------------------------------------------------------------------------------
// Type-name rendering from AST nodes
// ---------------------------------------------------------------------------------------------
function renderType(typeName) {
  if (!typeName) return "";
  switch (typeName.type) {
    case "ElementaryTypeName":
      return typeName.stateMutability ? `${typeName.name} ${typeName.stateMutability}` : typeName.name;
    case "UserDefinedTypeName":
      return typeName.namePath;
    case "ArrayTypeName": {
      const base = renderType(typeName.baseTypeName);
      const len = typeName.length && typeName.length.number !== undefined ? typeName.length.number : "";
      return `${base}[${len}]`;
    }
    case "Mapping":
      return `mapping(${renderType(typeName.keyType)} => ${renderType(typeName.valueType)})`;
    case "FunctionTypeName":
      return "function";
    default:
      return typeName.name || "";
  }
}

function renderParam(p) {
  const parts = [renderType(p.typeName)];
  if (p.storageLocation) parts.push(p.storageLocation);
  if (p.name) parts.push(p.name);
  return parts.join(" ");
}

// ---------------------------------------------------------------------------------------------
// Signature rendering (wraps when a single line would exceed 100 chars)
// ---------------------------------------------------------------------------------------------
function renderFunction(fn) {
  const params = (fn.parameters || []).map(renderParam);
  const rets = (fn.returnParameters || []).map(renderParam);

  const tail = [];
  tail.push("external");
  if (fn.stateMutability && fn.stateMutability !== "nonpayable") tail.push(fn.stateMutability);
  let suffix = tail.join(" ");
  if (rets.length) suffix += ` returns (${rets.join(", ")})`;

  const oneLine = `function ${fn.name}(${params.join(", ")}) ${suffix};`;
  if (oneLine.length <= 100) return oneLine;

  const wrapped = [`function ${fn.name}(`];
  params.forEach((p, i) => wrapped.push(`    ${p}${i < params.length - 1 ? "," : ""}`));
  wrapped.push(`) ${suffix};`);
  return wrapped.join("\n");
}

// ---------------------------------------------------------------------------------------------
// Global index of struct/enum definitions (verbatim source by char range)
// ---------------------------------------------------------------------------------------------
const typeIndex = new Map(); // typeName -> { source, file, kind }

// Strip the original nesting indentation from a verbatim source slice so the block reads as a
// top-level declaration. Dedents every line after the first by the closing line's indent width.
function dedentBlock(src) {
  const lines = src.split("\n");
  if (lines.length < 2) return src;
  const pad = (lines[lines.length - 1].match(/^(\s*)/)[1] || "").length;
  if (pad === 0) return src;
  const prefix = " ".repeat(pad);
  return [lines[0], ...lines.slice(1).map((l) => (l.startsWith(prefix) ? l.slice(pad) : l.replace(/^\s+/, "")))].join(
    "\n",
  );
}

function indexTypes(ast, source, file) {
  parser.visit(ast, {
    StructDefinition: (node) => {
      if (node.range) {
        const [s, e] = node.range;
        typeIndex.set(node.name, { source: dedentBlock(source.slice(s, e + 1)), file, kind: "struct", node });
      }
    },
    EnumDefinition: (node) => {
      if (node.range) {
        const [s, e] = node.range;
        typeIndex.set(node.name, { source: dedentBlock(source.slice(s, e + 1)), file, kind: "enum", node });
      }
    },
  });
}

const parsedCache = new Map();
function parseFile(file) {
  if (parsedCache.has(file)) return parsedCache.get(file);
  const source = fs.readFileSync(file, "utf8");
  let ast = null;
  try {
    ast = parser.parse(source, { range: true, tolerant: true });
  } catch (err) {
    console.error(`parse failed: ${file}: ${err.message}`);
  }
  const res = { source, ast };
  parsedCache.set(file, res);
  return res;
}

// Build the global type index across the whole contracts tree.
for (const file of allSolFiles) {
  const { source, ast } = parseFile(file);
  if (ast) indexTypes(ast, source, file);
}

// ---------------------------------------------------------------------------------------------
// Facet name derivation
// ---------------------------------------------------------------------------------------------
const ACRONYMS = new Set(["ssi", "kyc", "kpi", "usa", "eip", "erc", "abaf"]);

function splitCamel(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim()
    .split(" ")
    .map((w) => {
      if (ACRONYMS.has(w.toLowerCase())) return w.toUpperCase();
      if (w.endsWith("s") && ACRONYMS.has(w.slice(0, -1).toLowerCase())) return w.slice(0, -1).toUpperCase() + "s";
      return w;
    })
    .join(" ");
}

// Heading is derived from the interface name (reliably PascalCased), not the resolver key —
// resolver keys are inconsistently cased in source (e.g. `Securityholders`,
// `ClearingHoldbypartition`). The resolver key is still surfaced verbatim as data.
function facetName(interfaceName) {
  return splitCamel(interfaceName.replace(/^I/, ""));
}

// ---------------------------------------------------------------------------------------------
// Collect referenced user-defined types from a function's params/returns
// ---------------------------------------------------------------------------------------------
function collectRefs(fn, refs) {
  const scan = (tn) => {
    if (!tn) return;
    if (tn.type === "UserDefinedTypeName") refs.add(tn.namePath.split(".").pop());
    else if (tn.type === "ArrayTypeName") scan(tn.baseTypeName);
    else if (tn.type === "Mapping") {
      scan(tn.keyType);
      scan(tn.valueType);
    }
  };
  [...(fn.parameters || []), ...(fn.returnParameters || [])].forEach((p) => scan(p.typeName));
}

// ---------------------------------------------------------------------------------------------
// Per-file facet extraction
// ---------------------------------------------------------------------------------------------
function extractFacet(file) {
  const { source, ast } = parseFile(file);
  if (!ast) return null;

  // Only consider `interface` definitions declared in this file; ignore any contracts/libraries.
  const interfaces = (ast.children || []).filter((n) => n.type === "ContractDefinition" && n.kind === "interface");
  if (interfaces.length === 0) return null;

  const stem = path.basename(file, ".sol");
  // Prefer the interface whose name matches the filename; otherwise the first declared.
  const mainInterface = interfaces.find((i) => i.name === stem) || interfaces[0];

  const functions = [];
  const refs = new Set();
  for (const iface of interfaces) {
    for (const node of iface.subNodes || []) {
      if (node.type !== "FunctionDefinition") continue;
      if (node.isConstructor || node.isReceiveEther || node.isFallback) continue;
      if (!node.name) continue;
      functions.push(node);
      collectRefs(node, refs);
    }
  }

  if (functions.length === 0) return null;

  const rel = path.relative(contractsRoot, file).split(path.sep).join("/");
  const keyMatch = source.match(/resolverKey\s+([A-Za-z0-9_]+)/);

  // Resolve referenced types, transitively following struct members so nested custom types
  // (e.g. an enum used by a struct field) are also documented. Skip names we never indexed.
  const types = [];
  const seen = new Set();
  const queue = [...refs];
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    const def = typeIndex.get(name);
    if (!def) continue;
    types.push({ name, source: def.source, file: def.file, kind: def.kind });
    if (def.kind === "struct") {
      for (const member of def.node.members || []) {
        const inner = new Set();
        collectRefs({ parameters: [member], returnParameters: [] }, inner);
        inner.forEach((n) => queue.push(n));
      }
    }
  }

  return {
    file,
    rel,
    name: facetName(mainInterface.name),
    resolverKey: keyMatch ? keyMatch[1] : null,
    functions,
    types,
  };
}

// ---------------------------------------------------------------------------------------------
// Ordering: top-level facets, then layer_1, layer_2, layer_3; alphabetical within each.
// ---------------------------------------------------------------------------------------------
function layerRank(rel) {
  if (rel.includes("/facets/layer_1/")) return 1;
  if (rel.includes("/facets/layer_2/")) return 2;
  if (rel.includes("/facets/layer_3/")) return 3;
  return 0;
}

const facets = interfaceFiles
  .map(extractFacet)
  .filter(Boolean)
  .sort((a, b) => layerRank(a.rel) - layerRank(b.rel) || a.name.localeCompare(b.name) || a.rel.localeCompare(b.rel));

// Disambiguate any colliding headings by appending the interface stem, so anchors stay unique.
const byName = new Map();
for (const f of facets) byName.set(f.name, (byName.get(f.name) || 0) + 1);
for (const f of facets) {
  if (byName.get(f.name) > 1) f.name = `${f.name} (${path.basename(f.file, ".sol")})`;
}

// GitHub-style heading slug: lowercase, drop punctuation, spaces to hyphens. Dedupe collisions
// with a numeric suffix, matching GitHub's anchor generation so the TOC links resolve.
const slugCounts = new Map();
function slug(text) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const n = slugCounts.get(base) || 0;
  slugCounts.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

const LAYER_TITLES = ["Core / supporting facets", "Layer 1", "Layer 2", "Layer 3"];

// Assign each facet its anchor up front (in document order) so the TOC and body agree.
for (const f of facets) f.anchor = slug(f.name);

// ---------------------------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------------------------
const out = [];
out.push("# ATS Facet Methods");
out.push("");
out.push("> Generated and maintained via the `solidity-natspec` skill. Update the relevant section whenever a");
out.push("> facet interface changes.");
out.push("");

// Table of contents, grouped by layer.
out.push("## Contents");
out.push("");
let tocLayer = -1;
for (const facet of facets) {
  const lr = layerRank(facet.rel);
  if (lr !== tocLayer) {
    if (tocLayer !== -1) out.push("");
    tocLayer = lr;
    out.push(`**${LAYER_TITLES[lr]}**`);
    out.push("");
  }
  out.push(`- [${facet.name}](#${facet.anchor})`);
}
out.push("");

let currentLayer = -1;
for (const facet of facets) {
  const lr = layerRank(facet.rel);
  if (lr !== currentLayer) {
    currentLayer = lr;
    out.push(`<!-- ${lr === 0 ? "core / supporting facets" : `layer_${lr}`} -->`);
    out.push("");
  }

  out.push(`## ${facet.name}`);
  out.push("");
  out.push(`- Interface: \`${facet.rel}\``);
  if (facet.resolverKey) out.push(`- Resolver key: \`${facet.resolverKey}\``);
  out.push("");
  out.push("```solidity");
  out.push(facet.functions.map(renderFunction).join("\n"));
  out.push("```");
  out.push("");

  if (facet.types.length) {
    out.push("### Types");
    out.push("");
    out.push("```solidity");
    const blocks = facet.types.map((t) => {
      const where = path.relative(contractsRoot, t.file).split(path.sep).join("/");
      return `// declared in ${where}\n${t.source}`;
    });
    out.push(blocks.join("\n\n"));
    out.push("```");
    out.push("");
  }
}

const target = path.join(contractsRoot, "FACETS_METHODS.md");
fs.writeFileSync(target, out.join("\n").replace(/\n+$/, "\n"));
console.error(`Wrote ${facets.length} facets to ${target}`);
