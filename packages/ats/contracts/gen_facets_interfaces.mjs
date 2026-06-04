#!/usr/bin/env node
// Generates packages/ats/contracts/FACETS_INTERFACES.md: a per-facet reference of every external/public
// entry point declared by the facet interfaces under contracts/facets/**, with full input
// parameters, return values, and any referenced struct/enum types. Each facet section also lists
// the events and errors that facet can emit/revert with, plus a flat Roles table at the end.
//
// Methods and types are read from the Solidity COMPILER's ASTs, which Hardhat writes to
// artifacts/build-info/*.json on every compile. Using the compiler's own AST means any syntax that
// compiles can be read here — there is no separate Solidity grammar to fall behind solc. Events and
// errors are grouped per facet by joining to the generated registry (scripts/domain/atsRegistry.generated.ts)
// on the facet's resolver-key value: each facet interface declares a `bytes32 constant RESOLVER_KEY_* = 0x...;`
// whose value keys that facet's events/errors in the registry. Facets whose interface declares no
// such constant (parent / protocol interfaces) list methods only.
//
// Usage (from packages/ats/contracts):
//   npx hardhat compile          # produces artifacts/build-info AND scripts/domain/atsRegistry.generated.ts
//   node gen_facets_interfaces.mjs
//
// The script is the deterministic engine behind the FACETS_INTERFACES.md upkeep described in the
// solidity-natspec SKILL.md. It reads compiler ASTs (not regex) so multi-line signatures and wrapped
// parameter lists are handled correctly.
//
// ---------------------------------------------------------------------------------------------
// Relies on (violations are silent unless marked LOUD):
// ---------------------------------------------------------------------------------------------
// Build / environment
//   - Run after `npm run compile` — reads artifacts/build-info + the generated registry. [LOUD]
//   - Sources on disk match what was compiled (no edits since compile). [LOUD]
//   - `typescript` is resolvable from node_modules.
//
// Which interfaces get documented
//   - Facet interface is in a file whose name starts `I` + upper-case/digit.
//   - File is under contracts/facets, contracts/factory, or contracts/infrastructure.
//   - File is NOT under contracts/factory/ERC3643/.
//   - The type is declared `interface` (not contract/library).
//
// Resolver-key join (the per-facet events/errors)
//   - One RESOLVER_KEY_* per interface file (the first top-level one is used — see note).
//   - Declared file-level as `bytes32 constant RESOLVER_KEY_* = 0x..;` with a literal hex value.
//   - Its value equals the facet's resolverKey.value in the registry.
//
// Generated registry shape
//   - Keeps field names: FACET_REGISTRY, resolverKey.value, events, errors, name, signature.full.
//   - Missing FACET_REGISTRY aborts. [LOUD]
//
// No name shadowing across files
//   - event / error names are globally unique (drives the name -> signature lookup).
//   - struct / enum names are globally unique (collision = last file wins).
//
// Referenced types
//   - Only struct / enum declared under contracts/ are inlined (npm-package types are skipped).
//   - A type is resolved by its simple name (`Lib.Foo` is matched as `Foo`).
//
// Roles
//   - Declared file-level as `bytes32 constant`, named ROLE_* or DEFAULT_ADMIN_ROLE, with a literal value.
//   - In-contract or computed (`keccak256(...)`) roles are not listed.
//
//
// RESOLVER_KEY note: the constant is file-level (not inside the interface), so there is no
// language-level link between a key and its interface — the pairing is purely "first key in the
// file". In files with several keys (e.g. IProceedRecipients.sol declares RESOLVER_KEY_PROCEED_RECIPIENTS
// and ..._KPI_LINKED_RATE) the first wins; if that is the wrong one, the facet joins to the wrong
// registry entry (or none) and loses its events/errors.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// This script lives in the contracts package root, alongside the FACETS_INTERFACES.md it produces.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsRoot = __dirname;

// The TypeScript compiler is used to parse the generated registry module into an AST. Importing it
// resolves from the package or monorepo root node_modules (hoisted), the same as any dependency.
const ts = (await import("typescript")).default;

// Forward-slash source path relative to the contracts package root (the key Hardhat uses too).
const relOf = (file) => path.relative(contractsRoot, file).split(path.sep).join("/");

// Trees ignored EVERYWHERE — neither documented nor scanned for types/events/errors/roles:
//   - contracts/test       : mocks and test-only helpers.
//   - contracts/factory/ERC3643 : the ERC3643 reference suite (not ATS facets).
const isIgnored = (rel) => rel.startsWith("contracts/test/") || rel.includes("contracts/factory/ERC3643/");

// `--check` runs the conditions doctor (see runChecks) instead of writing the document: it reports
// anything that could silently corrupt FACETS_INTERFACES.md and exits non-zero on hard problems.
const CHECK = process.argv.slice(2).includes("--check");

// ---------------------------------------------------------------------------------------------
// Load the Solidity compiler ASTs from Hardhat build-info
// ---------------------------------------------------------------------------------------------
// Hardhat writes one build-info JSON per distinct compiler input (e.g. one per solc version). Each
// holds the full solc input (with verbatim source `content`) and output (with the resolved `ast`).
// We merge them into a single map keyed by source path. The verbatim content is kept alongside each
// AST because struct/enum bodies are reproduced by slicing it with the node's byte offsets.
const buildInfoDir = path.join(contractsRoot, "artifacts/build-info");
let buildInfoFiles = [];
try {
  buildInfoFiles = fs.readdirSync(buildInfoDir).filter((f) => f.endsWith(".json"));
} catch {
  /* directory absent -> handled below */
}
if (buildInfoFiles.length === 0) {
  throw new Error(`No Hardhat build-info in ${buildInfoDir}. Run \`npm run compile\` first.`);
}

const astBySource = new Map(); // sourcePath -> { ast, content }
for (const f of buildInfoFiles) {
  const bi = JSON.parse(fs.readFileSync(path.join(buildInfoDir, f), "utf8"));
  const outSources = (bi.output && bi.output.sources) || {};
  const inSources = (bi.input && bi.input.sources) || {};
  for (const [name, o] of Object.entries(outSources)) {
    if (!o.ast || astBySource.has(name)) continue; // first build-info wins (versions do not overlap in practice)
    const content = inSources[name] && inSources[name].content;
    if (content == null) continue;
    astBySource.set(name, { ast: o.ast, content });
  }
}

// Slice a struct/enum body verbatim from its source. solc `src` is "byteStart:byteLength:fileIndex"
// — BYTE offsets, so the slice is taken over a Buffer (the codebase uses multi-byte characters).
function srcSlice(content, src) {
  const [start, len] = src.split(":").map(Number);
  return Buffer.from(content, "utf8")
    .subarray(start, start + len)
    .toString("utf8");
}

// Depth-first visit of every AST node (objects carrying a string `nodeType`), arrays included.
function visit(node, cb) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) visit(n, cb);
    return;
  }
  if (typeof node.nodeType === "string") cb(node);
  for (const k in node) {
    if (k === "typeDescriptions") continue; // leaf metadata, never holds child nodes
    visit(node[k], cb);
  }
}

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

const allSolFiles = walk(path.join(contractsRoot, "contracts")).filter((f) => !isIgnored(relOf(f)));

// Freshness / coverage guard. A file on disk whose content differs from the compiled content would
// yield a document that disagrees with the source — abort loudly. A file absent from build-info was
// excluded from compilation (e.g. contracts/test); warn and skip rather than fail.
const stale = [];
const uncompiled = [];
for (const file of allSolFiles) {
  const rel = relOf(file);
  const entry = astBySource.get(rel);
  if (!entry) {
    uncompiled.push(rel);
    continue;
  }
  if (fs.readFileSync(file, "utf8") !== entry.content) stale.push(rel);
}
if (stale.length) {
  throw new Error(
    `build-info is stale for ${stale.length} file(s) — run \`npx hardhat compile\`:\n  ${stale.join("\n  ")}`,
  );
}
if (uncompiled.length) {
  console.error(
    `warning: ${uncompiled.length} contracts/ .sol file(s) not in build-info (excluded from compile?), skipped:\n  ${uncompiled.join("\n  ")}`,
  );
}

// Global collection (types/events/errors/roles) spans every compiled file under contracts/, in walk
// order so that "last writer wins" / "first role wins" resolve identically run to run.
const globalSources = allSolFiles.map(relOf).filter((rel) => astBySource.has(rel));

// Interfaces are sourced from the facets, factory, and infrastructure trees. The ERC3643
// reference suite under factory/ is excluded.
const interfaceDirs = ["contracts/facets", "contracts/factory", "contracts/infrastructure"];
// Interface convention in this repo: `I<PascalName>` — the char after the leading `I` is
// upper-case or a digit. This excludes concrete contracts that merely start with I
// (Identity.sol, Initializer.sol, InterestRate.sol, and their *Facet.sol variants).
const interfaceFiles = interfaceDirs
  .flatMap((d) => walk(path.join(contractsRoot, d)))
  .filter((f) => /^I[A-Z0-9]/.test(path.basename(f)))
  .filter((f) => !isIgnored(relOf(f)));

// Every interface we intend to document must have been compiled; otherwise the output would silently
// omit it. (Excluded test interfaces never reach here — they are not under interfaceDirs.)
const missingInterfaces = interfaceFiles.map(relOf).filter((rel) => !astBySource.has(rel));
if (missingInterfaces.length) {
  throw new Error(
    `interface file(s) not in build-info — run \`npx hardhat compile\`:\n  ${missingInterfaces.join("\n  ")}`,
  );
}

// ---------------------------------------------------------------------------------------------
// Type-name rendering from solc AST nodes
// ---------------------------------------------------------------------------------------------
function renderType(typeName) {
  if (!typeName) return "";
  switch (typeName.nodeType) {
    case "ElementaryTypeName":
      // solc tags every `address` with stateMutability ("nonpayable"); only `payable` is meaningful.
      return typeName.stateMutability === "payable" ? `${typeName.name} payable` : typeName.name;
    case "UserDefinedTypeName":
      // pathNode.name is the dotted path as written (e.g. "Lib.Foo"); older solc puts it on `name`.
      return typeName.pathNode ? typeName.pathNode.name : typeName.name;
    case "ArrayTypeName": {
      const base = renderType(typeName.baseType);
      const len = typeName.length && typeName.length.value !== undefined ? typeName.length.value : "";
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
  // solc uses "default" for value types with no explicit data location.
  if (p.storageLocation && p.storageLocation !== "default") parts.push(p.storageLocation);
  if (p.name) parts.push(p.name);
  return parts.join(" ");
}

// Parameter arrays differ by node: function params nest under `.parameters.parameters`, while struct
// members (passed in synthetically) arrive as a plain array. Normalise both to a flat array.
const paramList = (pl) => (pl && Array.isArray(pl.parameters) ? pl.parameters : Array.isArray(pl) ? pl : []);

// ---------------------------------------------------------------------------------------------
// Signature rendering (wraps when a single line would exceed 100 chars)
// ---------------------------------------------------------------------------------------------
function renderFunction(fn) {
  const params = paramList(fn.parameters).map(renderParam);
  const rets = paramList(fn.returnParameters).map(renderParam);

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
  if (p.indexed) parts.push("indexed");
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
// Global index of struct/enum definitions (verbatim source by byte range)
// ---------------------------------------------------------------------------------------------
const typeIndex = new Map(); // typeName -> { source, file, kind, node }

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

// ---------------------------------------------------------------------------------------------
// Global collection of events, custom errors, and role constants across the WHOLE contracts tree.
// These sections span every compiled file under contracts/ except the ignored trees (contracts/test
// and the ERC3643 reference suite — see isIgnored), matching the facets that get documented.
// ---------------------------------------------------------------------------------------------
const eventMap = new Map(); // dedup key -> { name, rendered, files:Set }
const errorMap = new Map(); // dedup key -> { name, rendered, files:Set }
const roles = []; // { name, value }
const roleSeen = new Set();

// Identity of an event/error declaration: name plus ordered param types (and `indexed` flags).
// Param names are ignored so the same signature declared in multiple files collapses to one entry.
function declKey(name, params) {
  return `${name}(${params.map((p) => renderType(p.typeName) + (p.indexed ? " indexed" : "")).join(",")})`;
}

function collectDecl(map, keyword, node, rel) {
  const params = paramList(node.parameters);
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

// Role identifiers only — file-level `bytes32 constant ROLE_<NAME>` (plus OpenZeppelin's
// `DEFAULT_ADMIN_ROLE`) with a literal value. Other bytes32 constants (resolver keys, storage slots,
// type hashes) and computed roles (keccak256(...)) are excluded.
function collectRole(node) {
  if (!node.constant) return;
  const tn = node.typeName;
  if (!tn || tn.nodeType !== "ElementaryTypeName" || tn.name !== "bytes32") return;
  if (!node.name.startsWith("ROLE_") && node.name !== "DEFAULT_ADMIN_ROLE") return;
  if (roleSeen.has(node.name)) return;
  roleSeen.add(node.name);
  const v = node.value;
  const value = v && v.nodeType === "Literal" && v.kind === "number" ? v.value : "";
  roles.push({ name: node.name, value });
}

// Build the global type index across the whole contracts tree, and collect events/errors/roles.
for (const rel of globalSources) {
  const { ast, content } = astBySource.get(rel);
  const file = path.join(contractsRoot, rel);
  visit(ast, (node) => {
    switch (node.nodeType) {
      case "StructDefinition":
        typeIndex.set(node.name, { source: dedentBlock(srcSlice(content, node.src)), file, kind: "struct", node });
        break;
      case "EnumDefinition":
        typeIndex.set(node.name, { source: dedentBlock(srcSlice(content, node.src)), file, kind: "enum", node });
        break;
      case "EventDefinition":
        collectDecl(eventMap, "event", node, rel);
        break;
      case "ErrorDefinition":
        collectDecl(errorMap, "error", node, rel);
        break;
    }
  });
  // Roles are file-level constants only (direct children of the SourceUnit).
  for (const node of ast.nodes || []) if (node.nodeType === "VariableDeclaration") collectRole(node);
}

// ---------------------------------------------------------------------------------------------
// Per-facet events/errors, sourced from the generated registry and joined by resolver-key value.
// The registry (scripts/domain/atsRegistry.generated.ts) groups, under each facet entry, every
// event/error that facet can emit/revert with — including inherited and library-level ones, so it
// is richer than the interface declarations alone. We parse it with the TypeScript compiler into an
// AST and read the FACET_REGISTRY object literal structurally, keying each entry by its resolver-key
// hash (which matches the RESOLVER_KEY_* constant declared in the facet interface). Parsing the AST
// — rather than the source text — makes the join immune to reformatting of the generated file
// (indentation, brace style, key ordering): only the property *structure* matters, not its
// whitespace. Returns Map<resolverKeyValue, {events, errors}> where each entry is { name, full }.
// ---------------------------------------------------------------------------------------------

// Read a named property's initializer from an object-literal AST node (undefined if absent).
function tsProp(objNode, key) {
  if (!objNode || !ts.isObjectLiteralExpression(objNode)) return undefined;
  for (const p of objNode.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const n = p.name;
    const name = ts.isIdentifier(n) || ts.isStringLiteral(n) ? n.text : undefined;
    if (name === key) return p.initializer;
  }
  return undefined;
}

// Read a string-literal AST node's value (undefined if the node is not a string literal).
function tsStr(node) {
  if (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) return node.text;
  return undefined;
}

function parseRegistry() {
  const file = path.join(contractsRoot, "scripts/domain/atsRegistry.generated.ts");
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, /* setParentNodes */ true);

  // Locate `export const FACET_REGISTRY = { ... }`. Infrastructure/storage registries are separate
  // top-level constants and are intentionally not consulted here.
  let registryObj = null;
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === "FACET_REGISTRY") registryObj = decl.initializer;
    }
  }
  if (!registryObj || !ts.isObjectLiteralExpression(registryObj)) {
    throw new Error("FACET_REGISTRY object literal not found in scripts/domain/atsRegistry.generated.ts");
  }

  // Each element of an `events`/`errors` array is { name, signature: { full } }; keep the name and
  // the `full` signature, filtered to the expected keyword so nothing else can leak in.
  const readDecls = (arrNode, keyword) => {
    if (!arrNode || !ts.isArrayLiteralExpression(arrNode)) return [];
    const out = [];
    for (const el of arrNode.elements) {
      if (!ts.isObjectLiteralExpression(el)) continue;
      const name = tsStr(tsProp(el, "name"));
      const full = tsStr(tsProp(tsProp(el, "signature"), "full"));
      if (name && full && full.startsWith(`${keyword} `)) out.push({ name, full });
    }
    return out;
  };

  const byValue = new Map();
  for (const facetProp of registryObj.properties) {
    if (!ts.isPropertyAssignment(facetProp)) continue;
    const facetObj = facetProp.initializer;
    const value = tsStr(tsProp(tsProp(facetObj, "resolverKey"), "value"));
    if (!value) continue; // facets without a resolver key get no events/errors, as before.
    byValue.set(value.toLowerCase(), {
      events: readDecls(tsProp(facetObj, "events"), "event"),
      errors: readDecls(tsProp(facetObj, "errors"), "error"),
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
    if (tn.nodeType === "UserDefinedTypeName") {
      const nm = tn.pathNode ? tn.pathNode.name : tn.name;
      if (nm) refs.add(nm.split(".").pop());
    } else if (tn.nodeType === "ArrayTypeName") scan(tn.baseType);
    else if (tn.nodeType === "Mapping") {
      scan(tn.keyType);
      scan(tn.valueType);
    }
  };
  [...paramList(fn.parameters), ...paramList(fn.returnParameters)].forEach((p) => scan(p.typeName));
}

// ---------------------------------------------------------------------------------------------
// Per-file facet extraction
// ---------------------------------------------------------------------------------------------
function extractFacet(file) {
  const rel = relOf(file);
  const entry = astBySource.get(rel);
  if (!entry) return null; // guarded above, but stay defensive
  const ast = entry.ast;

  // Only consider `interface` definitions declared in this file; ignore any contracts/libraries.
  const interfaces = (ast.nodes || []).filter(
    (n) => n.nodeType === "ContractDefinition" && n.contractKind === "interface",
  );
  if (interfaces.length === 0) return null;

  const stem = path.basename(file, ".sol");
  // Prefer the interface whose name matches the filename; otherwise the first declared.
  const mainInterface = interfaces.find((i) => i.name === stem) || interfaces[0];

  const functions = [];
  const refs = new Set();
  for (const iface of interfaces) {
    for (const node of iface.nodes || []) {
      if (node.nodeType !== "FunctionDefinition") continue;
      if (node.kind !== "function") continue; // excludes constructor / fallback / receive
      if (!node.name) continue;
      functions.push(node);
      collectRefs(node, refs);
    }
  }

  if (functions.length === 0) return null;

  // The facet's resolver key is a file-level `bytes32 constant RESOLVER_KEY_* = 0x...;` declared in
  // the interface file (the concrete facet imports and returns it via getStaticResolverKey). The
  // value joins this facet to its events/errors in the generated registry. We take the FIRST such
  // top-level constant in source order. Interfaces without one (parent / protocol interfaces) get
  // no events/errors.
  let resolverKeyName = null;
  let resolverKeyValue = null;
  for (const node of ast.nodes || []) {
    if (node.nodeType !== "VariableDeclaration" || !node.constant) continue;
    if (!/^RESOLVER_KEY_[A-Z0-9_]+$/.test(node.name || "")) continue;
    const tn = node.typeName;
    if (!tn || tn.nodeType !== "ElementaryTypeName" || tn.name !== "bytes32") continue;
    const v = node.value;
    if (!v || v.nodeType !== "Literal" || typeof v.value !== "string" || !v.value.startsWith("0x")) continue;
    resolverKeyName = node.name;
    resolverKeyValue = v.value.toLowerCase();
    break;
  }

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
    resolverKeyName,
    resolverKeyValue,
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
// Conditions doctor (`--check`): verify the assumptions listed at the top of this file that fail
// SILENTLY, i.e. would drop or corrupt content without aborting a normal run. The loud preconditions
// (missing / stale build-info, missing FACET_REGISTRY) already throw during loading above. Reuses the
// exact ASTs and indexes the generator itself uses, so a clean check means a clean document.
// ---------------------------------------------------------------------------------------------
function topLevelResolverKeys(ast) {
  return (ast.nodes || [])
    .filter((n) => n.nodeType === "VariableDeclaration" && n.constant && /^RESOLVER_KEY_[A-Z0-9_]+$/.test(n.name || ""))
    .map((n) => n.name);
}
const hasInterface = (ast) =>
  (ast.nodes || []).some((n) => n.nodeType === "ContractDefinition" && n.contractKind === "interface");

function runChecks() {
  const problems = [];
  const add = (level, group, msg) => problems.push({ level, group, msg });
  const inInterfaceDir = (rel) => interfaceDirs.some((d) => rel.startsWith(`${d}/`));
  const isErc3643 = (rel) => rel.includes("contracts/factory/ERC3643/");

  // 1. Off-convention facet interfaces — an interface + resolver key whose filename fails the
  //    `I` + upper/digit rule is dropped without trace. (ERROR: the facet vanishes from the doc.)
  for (const [rel, { ast }] of astBySource) {
    if (!inInterfaceDir(rel) || isErc3643(rel)) continue;
    if (/^I[A-Z0-9]/.test(rel.split("/").pop())) continue;
    if (hasInterface(ast) && topLevelResolverKeys(ast).length)
      add("error", "Interfaces", `${rel} — facet interface with off-convention filename, DROPPED`);
  }

  // 2. Multiple resolver keys in one documented interface file — only the first is used.
  for (const f of facets) {
    const keys = topLevelResolverKeys(astBySource.get(f.rel).ast);
    if (keys.length > 1)
      add("warn", "Resolver key", `${f.rel} — ${keys.length} keys (${keys.join(", ")}); using ${f.resolverKeyName}`);
  }

  // 3. Facet declares a resolver key that does not join the registry — its events/errors are empty.
  for (const f of facets)
    if (f.resolverKeyValue && !registryByKey.has(f.resolverKeyValue))
      add("warn", "Resolver key", `${f.rel} — ${f.resolverKeyName} not in registry, no events/errors emitted`);

  // 4. Referenced types not indexed (declared outside contracts/, or a typo) — omitted from Types.
  for (const f of facets) {
    const refs = new Set();
    for (const fn of f.functions) collectRefs(fn, refs);
    const missing = [...refs].filter((n) => !typeIndex.has(n));
    if (missing.length) add("warn", "Types", `${f.rel} — type(s) not inlined (external/npm?): ${missing.join(", ")}`);
  }

  // 5. struct/enum name shadowing with DIFFERING bodies — collision, last file silently wins.
  const typeBodies = new Map(); // name -> Map(normalisedBody -> Set(files))
  for (const rel of globalSources) {
    const { ast, content } = astBySource.get(rel);
    visit(ast, (node) => {
      if (node.nodeType !== "StructDefinition" && node.nodeType !== "EnumDefinition") return;
      const body = srcSlice(content, node.src).replace(/\s+/g, " ").trim();
      if (!typeBodies.has(node.name)) typeBodies.set(node.name, new Map());
      const m = typeBodies.get(node.name);
      m.set(body, (m.get(body) || new Set()).add(rel));
    });
  }
  for (const [name, m] of typeBodies)
    if (m.size > 1)
      add(
        "warn",
        "Type shadowing",
        `${name} — ${m.size} differing definitions in ${[...m.values()].flatMap((s) => [...s]).join(", ")} (last wins)`,
      );

  // 6. event/error name shadowing with DIFFERING signatures — the name->signature lookup is
  //    first-wins by file order, so the rendered signature may be the wrong variant.
  for (const [kind, map] of [
    ["event", eventMap],
    ["error", errorMap],
  ]) {
    const byName = new Map();
    for (const d of map.values()) byName.set(d.name, (byName.get(d.name) || new Set()).add(d.rendered));
    for (const [name, sigs] of byName)
      if (sigs.size > 1)
        add(
          "warn",
          "Event/error shadowing",
          `${kind} ${name} — ${sigs.size} differing signatures across files (first wins)`,
        );
  }

  // 7. Roles in the wrong place / shape — in-contract roles are missed; non-literal values render blank.
  for (const rel of globalSources) {
    const { ast } = astBySource.get(rel);
    const topLevel = new Set((ast.nodes || []).filter((n) => n.nodeType === "VariableDeclaration"));
    visit(ast, (node) => {
      if (node.nodeType !== "VariableDeclaration" || !node.constant) return;
      const tn = node.typeName;
      if (!tn || tn.nodeType !== "ElementaryTypeName" || tn.name !== "bytes32") return;
      if (!node.name.startsWith("ROLE_") && node.name !== "DEFAULT_ADMIN_ROLE") return;
      if (!topLevel.has(node))
        add("error", "Roles", `${rel} — ${node.name} declared inside a contract, MISSED (move to file scope)`);
      else if (!(node.value && node.value.nodeType === "Literal" && node.value.kind === "number"))
        add("warn", "Roles", `${rel} — ${node.name} has a non-literal value, listed blank`);
    });
  }

  // 8. Unrecognised layer folder — ranked as a core facet, ordering may be off.
  for (const f of facets) {
    const m = f.rel.match(/\/facets\/(layer_[^/]+)\//);
    if (m && !["layer_1", "layer_2", "layer_3"].includes(m[1]))
      add("warn", "Output", `${f.rel} — unrecognised ${m[1]}, ranked as core`);
  }

  // Report, grouped, errors before warnings within each group.
  for (const group of [...new Set(problems.map((p) => p.group))]) {
    console.log(`\n${group}`);
    for (const p of problems
      .filter((x) => x.group === group)
      .sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1)))
      console.log(`  ${p.level === "error" ? "✗" : "⚠"} ${p.msg}`);
  }
  const errors = problems.filter((p) => p.level === "error").length;
  const warnings = problems.length - errors;
  console.log(
    problems.length
      ? `\n${errors} error(s), ${warnings} warning(s). ${errors ? "Errors drop or replace content that should appear — fix before regenerating." : "Warnings are advisory: review, but they may be benign (order-dependent or external types)."}`
      : "All checked conditions satisfied — FACETS_INTERFACES.md should generate cleanly. ✓",
  );
  process.exit(errors ? 1 : 0);
}

if (CHECK) runChecks();

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
      const where = relOf(t.file);
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
