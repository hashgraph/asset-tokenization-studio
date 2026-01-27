// SPDX-License-Identifier: Apache-2.0

/**
 * File system utilities for registry generation.
 *
 * @module registry-generator/utils/fileUtils
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Recursively find all files matching a pattern in a directory.
 */
export function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name.startsWith(".") ||
        entry.name === "artifacts" ||
        entry.name === "cache" ||
        entry.name === "typechain-types"
      ) {
        continue;
      }
      results.push(...findFiles(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Find all Solidity files in a directory.
 */
export function findSolidityFiles(contractsDir: string): string[] {
  return findFiles(contractsDir, /\.sol$/);
}

/**
 * Read file contents.
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Write content to file.
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * Extract relative path from a base directory.
 */
export function getRelativePath(fullPath: string, baseDir: string): string {
  return path.relative(baseDir, fullPath);
}

/**
 * Check if file exists.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Get file stats.
 */
export function getFileStats(filePath: string): fs.Stats {
  return fs.statSync(filePath);
}

/**
 * Calculate SHA-256 hash of file content.
 */
export function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto
    .createHash("sha256")
    .update(content as any)
    .digest("hex");
}
