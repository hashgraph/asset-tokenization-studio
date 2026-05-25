#!/usr/bin/env node
// NatSpec coverage checker for Solidity files.
//
// Scans a .sol file and reports declarations whose NatSpec does not satisfy the
// tag set required by solhint's `use-natspec` rule:
//
//   contract / interface / library  -> @title, @author, @notice
//   function / event / error        -> @notice; one @param per parameter with
//                                       matching names; one @return per named
//                                       return value with matching names
//   enum / struct / modifier        -> any NatSpec block with a recognised tag
//
// Elements preceded by `@inheritdoc X` are accepted without further checks.
//
// Heuristic only — for authoring guidance, not a compiler-grade validator. State
// variables are intentionally not checked (too easy to mis-detect); verify those
// manually using SKILL.md "What to cover".
//
// Usage: node scripts/check_natspec.mjs <path/to/file.sol>
// Exit code: 0 if every checked element passes, 1 if anything is missing or
// mismatched, 2 on invocation errors.

import { readFileSync, statSync } from "node:fs";
import { argv, exit } from "node:process";

const DECL_PATTERNS = [
  ["contract", /^\s*(?:abstract\s+)?contract\s+(\w+)/],
  ["interface", /^\s*interface\s+(\w+)/],
  ["library", /^\s*library\s+(\w+)/],
  ["enum", /^\s*enum\s+(\w+)/],
  ["struct", /^\s*struct\s+(\w+)/],
  ["event", /^\s*event\s+(\w+)/],
  ["error", /^\s*error\s+(\w+)/],
  ["modifier", /^\s*modifier\s+(\w+)/],
  ["function", /^\s*function\s+(\w+)/],
];

const CONTRACTISH = new Set(["contract", "interface", "library"]);
const CALLABLE = new Set(["function", "event", "error"]);

const NATSPEC_BLOCK_END = /\*\/\s*$/;
const NATSPEC_TRIPLE_SLASH = /^\s*\/\/\//;
const INHERITDOC_TAG = /@inheritdoc\s+\w+/;
const RECOGNISED_TAG = /@(notice|dev|inheritdoc|param|return|title|author)\b/;
const TAG_IN_LINE = /@(\w+)/g;
const PARAM_LINE = /@param\s+(\w+)/g;
const RETURN_LINE = /@return(?:\s+(\w+))?/g;

const isPlainLineComment = (line) => {
  const s = line.replace(/^\s+/, "");
  return s.startsWith("//") && !s.startsWith("///");
};

const collectNatspecLines = (origLines, idx) => {
  let i = idx - 1;
  while (i >= 0 && (origLines[i].trim() === "" || isPlainLineComment(origLines[i]))) {
    i -= 1;
  }
  if (i < 0) return [];

  if (NATSPEC_TRIPLE_SLASH.test(origLines[i])) {
    let j = i;
    while (j >= 0 && NATSPEC_TRIPLE_SLASH.test(origLines[j])) j -= 1;
    const block = origLines.slice(j + 1, i + 1);
    return block.some((line) => RECOGNISED_TAG.test(line)) ? block : [];
  }

  if (NATSPEC_BLOCK_END.test(origLines[i])) {
    let j = i;
    while (j >= 0 && !origLines[j].includes("/**")) j -= 1;
    if (j < 0) return [];
    const block = origLines.slice(j, i + 1);
    return block.some((line) => RECOGNISED_TAG.test(line)) ? block : [];
  }

  return [];
};

const tagsInBlock = (block) => {
  const tags = new Set();
  for (const line of block) {
    for (const m of line.matchAll(TAG_IN_LINE)) tags.add(m[1]);
  }
  return tags;
};

const paramsInBlock = (block) => {
  const names = [];
  for (const line of block) {
    for (const m of line.matchAll(PARAM_LINE)) names.push(m[1]);
  }
  return names;
};

const returnsInBlock = (block) => {
  const entries = [];
  for (const line of block) {
    for (const m of line.matchAll(RETURN_LINE)) entries.push(m[1]);
  }
  return entries;
};

const extractSignature = (strippedLines, startIdx) => {
  const parts = [];
  let depth = 0;
  let i = startIdx;
  while (i < strippedLines.length) {
    const line = strippedLines[i];
    parts.push(line);
    for (const ch of line) {
      if (ch === "(") depth += 1;
      else if (ch === ")") depth -= 1;
    }
    if (depth <= 0 && (line.includes("{") || line.includes(";"))) break;
    i += 1;
  }
  return parts.join(" ");
};

const parseParens = (signature, openerIndex) => {
  let depth = 0;
  for (let i = openerIndex; i < signature.length; i += 1) {
    const ch = signature[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return [signature.slice(openerIndex + 1, i), i];
    }
  }
  return ["", signature.length];
};

const splitTopLevel = (text) => {
  const out = [];
  let depth = 0;
  let buf = "";
  for (const ch of text) {
    if (ch === "," && depth === 0) {
      out.push(buf.trim());
      buf = "";
      continue;
    }
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;
    buf += ch;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
};

const lastIdentifierOrEmpty = (fragment) => {
  const tokens = fragment.match(/[A-Za-z_]\w*/g) || [];
  return tokens.length >= 2 ? tokens[tokens.length - 1] : "";
};

const parseCallableSignature = (signature, kind) => {
  const openIdx = signature.indexOf("(");
  if (openIdx === -1) return [[], []];
  const [paramsText, closeIdx] = parseParens(signature, openIdx);
  const paramNames = splitTopLevel(paramsText).filter(Boolean).map(lastIdentifierOrEmpty);

  const returnNames = [];
  if (kind === "function") {
    const tail = signature.slice(closeIdx);
    const returnsMatch = /\breturns\s*\(/.exec(tail);
    if (returnsMatch) {
      const rstart = closeIdx + returnsMatch.index + returnsMatch[0].length - 1;
      const [returnsText] = parseParens(signature, rstart);
      for (const fragment of splitTopLevel(returnsText)) {
        if (!fragment) continue;
        returnNames.push(lastIdentifierOrEmpty(fragment));
      }
    }
  }
  return [paramNames, returnNames];
};

// Blank out string literals and `//` comments so declaration regexes do not fire
// on tokens inside them. Preserves line count and column offsets so matches line
// up with the original file.
const stripStringsAndLineComments = (text) => {
  const out = [];
  const n = text.length;
  let i = 0;
  let inStr = null;
  let inLineComment = false;
  let inBlockComment = false;
  while (i < n) {
    const ch = text[i];
    const nxt = i + 1 < n ? text[i + 1] : "";

    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
        out.push(ch);
      } else {
        out.push(" ");
      }
      i += 1;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && nxt === "/") {
        inBlockComment = false;
        out.push("  ");
        i += 2;
        continue;
      }
      out.push(ch === "\n" ? ch : " ");
      i += 1;
      continue;
    }
    if (inStr) {
      if (ch === "\\" && nxt) {
        out.push("  ");
        i += 2;
        continue;
      }
      if (ch === inStr) {
        inStr = null;
        out.push(" ");
        i += 1;
        continue;
      }
      out.push(ch === "\n" ? ch : " ");
      i += 1;
      continue;
    }
    if (ch === "/" && nxt === "/") {
      inLineComment = true;
      out.push("  ");
      i += 2;
      continue;
    }
    if (ch === "/" && nxt === "*") {
      inBlockComment = true;
      out.push("  ");
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inStr = ch;
      out.push(" ");
      i += 1;
      continue;
    }
    out.push(ch);
    i += 1;
  }
  return out.join("");
};

// Mimic Python's list repr: ['a', 'b'] — chosen so diagnostics stay drop-in
// compatible with the former Python checker.
const pyRepr = (arr) => `[${arr.map((s) => `'${s}'`).join(", ")}]`;

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const checkElement = (kind, name, block, strippedLines, idx) => {
  const issues = [];
  if (block.length === 0) {
    issues.push("missing NatSpec block");
    return issues;
  }
  const blockText = block.join("\n");
  if (INHERITDOC_TAG.test(blockText)) return issues;

  const tags = tagsInBlock(block);
  if (CONTRACTISH.has(kind)) {
    for (const required of ["title", "author", "notice"]) {
      if (!tags.has(required)) issues.push(`missing @${required}`);
    }
    return issues;
  }
  if (CALLABLE.has(kind)) {
    if (!tags.has("notice")) issues.push("missing @notice");

    const signature = extractSignature(strippedLines, idx);
    const [paramNames, returnNames] = parseCallableSignature(signature, kind);

    const expectedParams = paramNames.filter(Boolean);
    const docParams = paramsInBlock(block);
    if (expectedParams.length > 0 && docParams.length === 0) {
      issues.push(`missing @param tags (expected ${pyRepr(expectedParams)})`);
    } else if (expectedParams.length > 0 && !arraysEqual(docParams, expectedParams)) {
      issues.push(`@param mismatch: expected ${pyRepr(expectedParams)}, got ${pyRepr(docParams)}`);
    }

    if (kind === "function") {
      const expectedReturns = returnNames.filter(Boolean);
      const docReturnsRaw = returnsInBlock(block);
      const docReturns = docReturnsRaw.filter(Boolean);
      if (expectedReturns.length > 0 && docReturnsRaw.length === 0) {
        issues.push(`missing @return tags (expected ${pyRepr(expectedReturns)})`);
      } else if (expectedReturns.length > 0 && !arraysEqual(docReturns, expectedReturns)) {
        issues.push(`@return mismatch: expected ${pyRepr(expectedReturns)}, got ${pyRepr(docReturnsRaw)}`);
      } else if (expectedReturns.length === 0 && returnNames.length > 0 && docReturnsRaw.length === 0) {
        issues.push("missing @return tag for unnamed return value");
      }
    }
    return issues;
  }
  return issues;
};

const checkFile = (path) => {
  const raw = readFileSync(path, "utf8");
  const stripped = stripStringsAndLineComments(raw);
  const strippedLines = stripped.split("\n");
  const origLines = raw.split("\n");
  const findings = [];
  for (let idx = 0; idx < strippedLines.length; idx += 1) {
    const line = strippedLines[idx];
    for (const [kind, pattern] of DECL_PATTERNS) {
      const m = pattern.exec(line);
      if (!m) continue;
      const name = m[1];
      const block = collectNatspecLines(origLines, idx);
      const issues = checkElement(kind, name, block, strippedLines, idx);
      if (issues.length > 0) findings.push([idx + 1, kind, name, issues]);
      break;
    }
  }
  return findings;
};

const main = () => {
  const args = argv.slice(2);
  if (args.length !== 1) {
    console.error("Usage: node scripts/check_natspec.mjs <path/to/file.sol>");
    return 2;
  }
  const path = args[0];
  if (!path.endsWith(".sol")) {
    console.error(`Not a Solidity file: ${path}`);
    return 2;
  }
  try {
    if (!statSync(path).isFile()) {
      console.error(`File not found: ${path}`);
      return 2;
    }
  } catch {
    console.error(`File not found: ${path}`);
    return 2;
  }

  const findings = checkFile(path);
  if (findings.length === 0) {
    console.log(`OK -- every checked element in ${path} passes NatSpec rules.`);
    console.log("Reminder: state variables are not checked; verify those via SKILL.md section 6.");
    return 0;
  }
  console.log(`NatSpec issues in ${path}:`);
  for (const [lineNo, kind, name, issues] of findings) {
    for (const issue of issues) {
      console.log(`  line ${lineNo}: ${kind} ${name} -- ${issue}`);
    }
  }
  const total = findings.reduce((acc, f) => acc + f[3].length, 0);
  console.log(`\n${total} issue(s) across ${findings.length} element(s). See SKILL.md templates.`);
  return 1;
};

exit(main());
