#!/usr/bin/env node
// Generates packages/ats/contracts/FACETS_INTERFACES.md: a per-facet reference of every external/public
// entry point declared by the facet interfaces under contracts/facets/**, with full input
// parameters, return values, and any referenced struct/enum types. Each facet section also lists
// the events and errors that facet can emit/revert with, plus a flat Roles table at the end.
//
// Methods and types are parsed from the interface ASTs. Events and errors are grouped per facet by
// joining to the generated registry (scripts/domain/atsRegistry.generated.ts) on the facet's
// resolver-key value: each facet interface declares a `bytes32 constant RESOLVER_KEY_* = 0x...;`
// whose value keys that facet's events/errors in the registry. Facets whose interface declares no
// such constant (parent / protocol interfaces) list methods only.
//
// Usage (from packages/ats/contracts):
//   node gen_facets_interfaces.mjs
//
// The script is the deterministic engine behind the FACETS_INTERFACES.md upkeep described in the
// solidity-natspec SKILL.md. It parses ASTs (not regex) so multi-line signatures and wrapped
// parameter lists are handled correctly.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// This script lives in the contracts package root, alongside the FACETS_INTERFACES.md it produces.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsRoot = __dirname;
const repoRoot = path.resolve(__dirname, "../../..");

// Resolve @solidity-parser/parser from the package or monorepo root node_modules.
const parserCandidates = [
  "packages/ats/contracts/node_modules/@solidity-parser/parser/dist/index.cjs.js",
  "node_modules/@solidity-parser/parser/dist/index.cjs.js",
  "node_modules/@solidity-parser/parser/dist/index.cjs",
];
const parserPath = parserCandidates.map((p) => path.join(repoRoot, p)).find((p) => fs.existsSync(p));
if (!parserPath) throw new Error("@solidity-parser/parser not found in node_modules");
const parserMod = await import(parserPath);
const parser = parserMod.default ?? parserMod;

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
// Interfaces are sourced from the facets, factory, and infrastructure trees. The ERC3643
// reference suite under factory/ is excluded.
const interfaceDirs = ["contracts/facets", "contracts/factory", "contracts/infrastructure"];
// Interface convention in this repo: `I<PascalName>` — the char after the leading `I` is
// upper-case or a digit. This excludes concrete contracts that merely start with I
// (Identity.sol, Initializer.sol, InterestRate.sol, and their *Facet.sol variants).
const interfaceFiles = interfaceDirs
  .flatMap((d) => walk(path.join(contractsRoot, d)))
  .filter((f) => /^I[A-Z0-9]/.test(path.basename(f)))
  .filter((f) => !path.relative(contractsRoot, f).split(path.sep).join("/").includes("contracts/factory/ERC3643/"));

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

// Param renderer for events — supports the `indexed` keyword (events have no storage location).
function renderEventParam(p) {
  const parts = [renderType(p.typeName)];
  if (p.isIndexed) parts.push("indexed");
  if (p.name) parts.push(p.name);
  return parts.join(" ");
}

// Generic event/error signature renderer (wraps when a single line would exceed 100 chars).
function renderDecl(keyword, name, params) {
  const oneLine = `${keyword} ${name}(${params.join(", ")});`;
  if (oneLine.length <= 100) return oneLine;
  const wrapped = [`${keyword} ${name}(`];
  params.forEach((p, i) => wrapped.push(`    ${p}${i < params.length - 1 ? "," : ""}`));
  wrapped.push(");");
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

// ---------------------------------------------------------------------------------------------
// Global collection of events, custom errors, and role constants across the WHOLE contracts tree.
// Unlike the Methods section (which excludes the ERC3643 reference suite), these sections span
// every file and subfolder under contracts/ — no folder is excluded.
// ---------------------------------------------------------------------------------------------
const eventMap = new Map(); // dedup key -> { name, rendered, files:Set }
const errorMap = new Map(); // dedup key -> { name, rendered, files:Set }
const roles = []; // { name, value }
const roleSeen = new Set();

// Identity of an event/error declaration: name plus ordered param types (and `indexed` flags).
// Param names are ignored so the same signature declared in multiple files collapses to one entry.
function declKey(name, params) {
  return `${name}(${params.map((p) => renderType(p.typeName) + (p.isIndexed ? " indexed" : "")).join(",")})`;
}

function collectDecl(map, keyword, node, rel) {
  const params = node.parameters || [];
  const key = declKey(node.name, params);
  const existing = map.get(key);
  if (existing) {
    existing.files.add(rel);
    return;
  }
  const renderParamFn = keyword === "event" ? renderEventParam : renderParam;
  map.set(key, {
    name: node.name,
    rendered: renderDecl(keyword, node.name, params.map(renderParamFn)),
    files: new Set([rel]),
  });
}

function collectRole(node) {
  if (!node.isDeclaredConst) return;
  const tn = node.typeName;
  if (!tn || tn.type !== "ElementaryTypeName" || tn.name !== "bytes32") return;
  // Role identifiers only — by convention `ROLE_<NAME>`, plus the OpenZeppelin `DEFAULT_ADMIN_ROLE`.
  // Excludes other bytes32 constants (resolver keys, storage slots, type hashes, etc.).
  if (!node.name.startsWith("ROLE_") && node.name !== "DEFAULT_ADMIN_ROLE") return;
  if (roleSeen.has(node.name)) return;
  roleSeen.add(node.name);
  const value = node.initialValue && node.initialValue.type === "NumberLiteral" ? node.initialValue.number : "";
  roles.push({ name: node.name, value });
}

// Build the global type index across the whole contracts tree, and collect events/errors/roles.
for (const file of allSolFiles) {
  const { source, ast } = parseFile(file);
  if (!ast) continue;
  indexTypes(ast, source, file);
  const rel = path.relative(contractsRoot, file).split(path.sep).join("/");
  parser.visit(ast, {
    EventDefinition: (n) => collectDecl(eventMap, "event", n, rel),
    CustomErrorDefinition: (n) => collectDecl(errorMap, "error", n, rel),
    FileLevelConstant: (n) => collectRole(n),
  });
}

// ---------------------------------------------------------------------------------------------
// Per-facet events/errors, sourced from the generated registry and joined by resolver-key value.
// The registry (scripts/domain/atsRegistry.generated.ts) groups, under each facet entry, every
// event/error that facet can emit/revert with — including inherited and library-level ones, so it
// is richer than the interface declarations alone. It is a stable generated TS module, so we parse
// it textually and key each entry by its resolver-key hash (which matches the RESOLVER_KEY_*
// constant declared in the facet interface). Returns Map<resolverKeyValue, {events, errors}> where
// each entry is { name, full }.
// ---------------------------------------------------------------------------------------------
function parseRegistry() {
  const file = path.join(contractsRoot, "scripts/domain/atsRegistry.generated.ts");
  const src = fs.readFileSync(file, "utf8");
  // Restrict to the FACET_REGISTRY object; infrastructure/storage registries are not facets.
  const seg = src.slice(src.indexOf("FACET_REGISTRY"), src.indexOf("TOTAL_FACETS"));
  const starts = [];
  for (const m of seg.matchAll(/^  [A-Za-z0-9_]+: \{$/gm)) starts.push(m.index);
  // Pairs each entry's name with its `full` signature, scoped to whatever slice it is run over.
  const entryRe = /name:\s*"([A-Za-z0-9_]+)",\s*signature:\s*\{\s*full:\s*"((?:event|error) [^"]*)"/g;
  const entries = (slice) => {
    const out = [];
    entryRe.lastIndex = 0;
    let e;
    while ((e = entryRe.exec(slice))) out.push({ name: e[1], full: e[2] });
    return out;
  };
  const byValue = new Map();
  for (let i = 0; i < starts.length; i++) {
    const block = seg.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : seg.length);
    const rk = block.match(/resolverKey:\s*\{\s*name:\s*"[^"]+",\s*value:\s*"([^"]+)"/);
    if (!rk) continue;
    // Blocks are ordered methods -> events -> errors -> factory; slice each array by its 4-space
    // header so method names never leak into the event/error lists.
    const ev = block.search(/\n {4}events: \[/);
    const er = block.search(/\n {4}errors: \[/);
    const fc = block.search(/\n {4}factory:/);
    const end = (a, b) => (a >= 0 ? a : b >= 0 ? b : undefined);
    byValue.set(rk[1].toLowerCase(), {
      events: ev >= 0 ? entries(block.slice(ev, end(er, fc))) : [],
      errors: er >= 0 ? entries(block.slice(er, fc >= 0 ? fc : undefined)) : [],
    });
  }
  return byValue;
}
const registryByKey = parseRegistry();

// Name -> rendered signature, from the whole-tree AST collection above. Event/error names are
// globally unique (the registry has zero overloaded names), so the name alone recovers the AST
// rendering — which keeps clean struct/enum type names and 100-char wrapping. The registry's own
// `full` is used only as a fallback for the rare name not present in the AST index.
const eventByName = new Map();
for (const d of eventMap.values()) if (!eventByName.has(d.name)) eventByName.set(d.name, d.rendered);
const errorByName = new Map();
for (const d of errorMap.values()) if (!errorByName.has(d.name)) errorByName.set(d.name, d.rendered);

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
  // The facet's resolver key is a file-level `bytes32 constant RESOLVER_KEY_* = 0x...;` declared in
  // the interface file (the concrete facet imports and returns it via getStaticResolverKey). We
  // capture both name and value: the value joins this facet to its events/errors in the generated
  // registry. Interfaces without such a constant (parent / protocol interfaces) get no events/errors.
  const keyMatch = source.match(/bytes32\s+constant\s+(RESOLVER_KEY_[A-Z0-9_]+)\s*=\s*(0x[0-9a-fA-F]+)/);

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
    resolverKeyName: keyMatch ? keyMatch[1] : null,
    resolverKeyValue: keyMatch ? keyMatch[2].toLowerCase() : null,
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

// Assign each facet its anchor up front (in document order) so the TOC and body agree.
for (const f of facets) f.anchor = slug(f.name);

// ---------------------------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------------------------
const out = [];
out.push("# ATS Facet Interfaces");
out.push("");
out.push("> **Generated file — do not edit by hand.** Regenerate after any facet interface change with:");
out.push("> ");
out.push("> ```bash");
out.push("> node gen_facets_interfaces.mjs");
out.push("> ```");
out.push("> ");
out.push("> Maintained via the `solidity-natspec` skill.");
out.push("");

// Table of contents: Facets (with every facet nested, each carrying its own events/errors) and
// the flat Roles table.
out.push("## Contents");
out.push("");
out.push("- [Facets](#facets)");
for (const facet of facets) {
  out.push(`  - [${facet.name}](#${facet.anchor})`);
}
out.push("- [Roles](#roles)");
out.push("");

out.push("## Facets");
out.push("");

let currentLayer = -1;
for (const facet of facets) {
  const lr = layerRank(facet.rel);
  if (lr !== currentLayer) {
    currentLayer = lr;
    out.push(`<!-- ${lr === 0 ? "core / supporting facets" : `layer_${lr}`} -->`);
    out.push("");
  }

  out.push(`### ${facet.name}`);
  out.push("");
  out.push(`- Interface: \`${facet.rel}\``);
  if (facet.resolverKeyName) {
    out.push(`- Resolver key: \`${facet.resolverKeyName}\` = \`${facet.resolverKeyValue}\``);
  }
  out.push("");
  out.push("```solidity");
  out.push(facet.functions.map(renderFunction).join("\n"));
  out.push("```");
  out.push("");

  // Events and errors are grouped per facet via the registry join (by resolver-key value). Facets
  // with no resolver key (parent / protocol interfaces) have no registry entry and so list no
  // events or errors. A registry-listed name is rendered from the AST index, falling back to the
  // registry's own `full` signature only if it is not found there.
  const reg = facet.resolverKeyValue ? registryByKey.get(facet.resolverKeyValue) : null;
  if (reg) {
    const pushDecls = (title, list, byName) => {
      if (!list.length) return;
      out.push(`#### ${title}`);
      out.push("");
      out.push("```solidity");
      out.push(
        list
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((d) => byName.get(d.name) || `${d.full};`)
          .join("\n"),
      );
      out.push("```");
      out.push("");
    };
    pushDecls("Events", reg.events, eventByName);
    pushDecls("Errors", reg.errors, errorByName);
  }

  if (facet.types.length) {
    out.push("#### Types");
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

// ---------------------------------------------------------------------------------------------
// Roles span the whole tree (events and errors are now listed per facet, above). Roles are not
// tracked per facet by the registry, so they remain a single flat table.
// ---------------------------------------------------------------------------------------------
out.push("## Roles");
out.push("");
out.push("| Role | Value |");
out.push("| --- | --- |");
for (const r of [...roles].sort((a, b) => a.name.localeCompare(b.name))) {
  out.push(`| \`${r.name}\` | \`${r.value}\` |`);
}
out.push("");

const target = path.join(contractsRoot, "FACETS_INTERFACES.md");
fs.writeFileSync(target, out.join("\n").replace(/\n+$/, "\n"));
const joined = facets.filter((f) => f.resolverKeyValue && registryByKey.has(f.resolverKeyValue)).length;
console.error(
  `Wrote ${facets.length} facets (${joined} joined to the registry for events/errors), ${roles.length} roles to ${target}`,
);
