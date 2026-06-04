#!/usr/bin/env node
"use strict";

/**
 * coverage-report.js
 *
 * Reads coverage.json (Istanbul/solidity-coverage format) and prints:
 *   • Overall line / branch / function / statement totals with progress bars
 *   • Top 10 files with worst combined (line + branch) coverage
 *   • Pending git changes — coverage for every modified .sol file
 *
 * Usage:
 *   coverage-report.js [path/to/coverage.json]
 *
 *   Defaults to ./coverage.json in the current working directory.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ── ANSI ─────────────────────────────────────────────────────────────────────
const R = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const YLW = "\x1b[33m";
const GRN = "\x1b[32m";
const CYN = "\x1b[36m";
const MAG = "\x1b[35m";

function colorFor(p) {
  if (p === null) return DIM;
  if (p < 50) return RED;
  if (p < 80) return YLW;
  return GRN;
}

/** Fixed-width (6 visible chars) coloured percentage string. */
function fmtPct(p) {
  if (p === null) return `${DIM}   N/A${R}`;
  return `${colorFor(p)}${`${p.toFixed(1)}%`.padStart(6)}${R}`;
}

/** Mini progress bar — width is in visible chars. */
function bar(p, w = 14) {
  if (p === null) return `${DIM}${"─".repeat(w)}${R}`;
  const f = Math.round((p / 100) * w);
  return `${colorFor(p)}${"█".repeat(f)}${DIM}${"░".repeat(w - f)}${R}`;
}

// ── Coverage calculation ──────────────────────────────────────────────────────
function calcCov(data) {
  const l = data.l || {};
  const b = data.b || {};
  const f = data.f || {};
  const s = data.s || {};

  const totalL = Object.keys(l).length;
  const covL = Object.values(l).filter((v) => v > 0).length;

  let totalB = 0,
    covB = 0;
  for (const arr of Object.values(b)) {
    for (const hit of arr) {
      totalB++;
      if (hit > 0) covB++;
    }
  }

  const totalF = Object.keys(f).length;
  const covF = Object.values(f).filter((v) => v > 0).length;

  const totalS = Object.keys(s).length;
  const covS = Object.values(s).filter((v) => v > 0).length;

  const linePct = totalL > 0 ? (covL / totalL) * 100 : null;
  const branchPct = totalB > 0 ? (covB / totalB) * 100 : null;
  const funcPct = totalF > 0 ? (covF / totalF) * 100 : null;
  const stmtPct = totalS > 0 ? (covS / totalS) * 100 : null;

  // Score = average of the dimensions that are present
  const dims = [linePct, branchPct].filter((v) => v !== null);
  const score = dims.length > 0 ? dims.reduce((a, v) => a + v, 0) / dims.length : 100;

  return { covL, totalL, linePct, covB, totalB, branchPct, covF, totalF, funcPct, covS, totalS, stmtPct, score };
}

function sumCov(entries) {
  return entries.reduce(
    (a, e) => {
      a.covL += e.cov.covL;
      a.totalL += e.cov.totalL;
      a.covB += e.cov.covB;
      a.totalB += e.cov.totalB;
      a.covF += e.cov.covF;
      a.totalF += e.cov.totalF;
      a.covS += e.cov.covS;
      a.totalS += e.cov.totalS;
      return a;
    },
    { covL: 0, totalL: 0, covB: 0, totalB: 0, covF: 0, totalF: 0, covS: 0, totalS: 0 },
  );
}

/** Truncate or pad a string to exactly n visible chars. */
function fit(str, n) {
  if (str.length > n) return "…" + str.slice(-(n - 1));
  return str.padEnd(n);
}

// ── Table ─────────────────────────────────────────────────────────────────────
const NAME_W = 50;

function printTable(entries) {
  console.log(`  ${fit("File", NAME_W)}  ${"Lines".padStart(6)}  ${"Branches".padStart(8)}  ${"Score".padStart(6)}`);
  console.log(`  ${DIM}${"─".repeat(NAME_W)}  ${"─".repeat(6)}  ${"─".repeat(8)}  ${"─".repeat(6)}${R}`);
  for (const e of entries) {
    const { cov } = e;
    // fmtPct returns 6 visible chars + ANSI; right columns need no extra padding
    console.log(
      `  ${fit(e.name, NAME_W)}  ${fmtPct(cov.linePct)}  ${fmtPct(cov.branchPct).padStart(8 + 9)}  ${fmtPct(cov.score)}`,
    );
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const coveragePath = process.argv[2] || path.join(process.cwd(), "coverage.json");

if (!fs.existsSync(coveragePath)) {
  console.error(`\n${RED}✗ coverage.json not found: ${coveragePath}${R}`);
  console.error(`  Run: npx hardhat coverage   (or pass the file path as argument)\n`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
const baseDir = path.dirname(path.resolve(coveragePath));

const allEntries = Object.entries(raw).map(([key, data]) => {
  const fullPath = data.path ? path.resolve(data.path) : path.resolve(baseDir, key);
  const rel = path.relative(baseDir, fullPath);
  const name = rel.startsWith("..") ? fullPath : rel;
  return { key, name, fullPath, cov: calcCov(data) };
});

// Overall totals
const T = sumCov(allEntries);
const oL = T.totalL > 0 ? (T.covL / T.totalL) * 100 : null;
const oB = T.totalB > 0 ? (T.covB / T.totalB) * 100 : null;
const oF = T.totalF > 0 ? (T.covF / T.totalF) * 100 : null;
const oS = T.totalS > 0 ? (T.covS / T.totalS) * 100 : null;

// Worst 10 (skip files with no trackable lines/branches)
const worst10 = allEntries
  .filter((e) => e.cov.totalL > 0 || e.cov.totalB > 0)
  .sort((a, b) => a.cov.score - b.cov.score)
  .slice(0, 10);

// Pending Solidity changes
let pendingEntries = [];
let pendingPaths = [];

try {
  const gitRoot = execSync("git rev-parse --show-toplevel", {
    cwd: baseDir,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();

  pendingPaths = execSync("git status --porcelain", {
    cwd: gitRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  })
    .split("\n")
    .filter((line) => line.length > 2 && line.slice(3).trim().endsWith(".sol"))
    .map((line) => path.resolve(gitRoot, line.slice(3).trim()));

  pendingEntries = allEntries.filter((e) => pendingPaths.includes(e.fullPath));
} catch (_) {
  // not a git repo or git unavailable
}

// ── Output ────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYN}  ◆ SOLIDITY COVERAGE REPORT${R}\n`);

// Overall
console.log(`${BOLD}  Overall  ${DIM}(${allEntries.length} files)${R}`);
for (const [label, p, cov, total] of [
  ["Lines", oL, T.covL, T.totalL],
  ["Branches", oB, T.covB, T.totalB],
  ["Functions", oF, T.covF, T.totalF],
  ["Statements", oS, T.covS, T.totalS],
]) {
  console.log(`    ${label.padEnd(12)} ${bar(p)}  ${fmtPct(p)}  ${DIM}(${cov}/${total})${R}`);
}
console.log();

const THRESHOLD = 80;
const ok = (oL === null || oL >= THRESHOLD) && (oB === null || oB >= THRESHOLD);
console.log(
  ok
    ? `  ${GRN}✓  Overall coverage meets the ${THRESHOLD}% threshold${R}`
    : `  ${YLW}⚠  Overall coverage is below the ${THRESHOLD}% threshold${R}`,
);
console.log();

// Top 10 worst
console.log(`${BOLD}  Top 10 Worst Coverage${R}  ${DIM}(score = avg line + branch)${R}`);
printTable(worst10);
console.log();

// Pending changes
if (pendingEntries.length > 0) {
  const n = pendingEntries.length;
  console.log(
    `${BOLD}${MAG}  Pending Changes  ${DIM}(${n} modified .sol file${n > 1 ? "s" : ""} with coverage data)${R}`,
  );
  printTable(pendingEntries);
  console.log();
} else if (pendingPaths.length > 0) {
  console.log(
    `${BOLD}${MAG}  Pending Changes${R}  ${YLW}⚠  ${pendingPaths.length} modified .sol file(s) not in coverage.json${R}`,
  );
  console.log(`  ${DIM}Re-run: npx hardhat coverage${R}`);
  console.log();
}
