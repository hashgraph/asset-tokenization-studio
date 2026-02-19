// SPDX-License-Identifier: Apache-2.0

/**
 * File system utilities for registry generation.
 *
 * @module tools/utils/fileUtils
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Recursively find all files matching a pattern in a directory.
 *
 * @param dir - Directory to search
 * @param pattern - Regular expression pattern to match files
 * @returns Array of absolute file paths
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
      // Skip node_modules, hidden directories, and build artifacts
      if (
        entry.name === "node_modules" ||
        entry.name.startsWith(".") ||
        entry.name === "artifacts" ||
        entry.name === "cache" ||
        entry.name === "typechain-types"
      ) {
        continue;
      }

      // Recursively search subdirectories
      results.push(...findFiles(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Find all Solidity files in a directory.
 *
 * @param contractsDir - Contracts directory to search
 * @returns Array of .sol file paths
 */
export function findSolidityFiles(contractsDir: string): string[] {
  return findFiles(contractsDir, /\.sol$/);
}

/**
 * Read file contents.
 *
 * @param filePath - Path to file
 * @returns File contents as string
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Write content to file.
 *
 * @param filePath - Path to write to
 * @param content - Content to write
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
 *
 * @param fullPath - Full file path
 * @param baseDir - Base directory
 * @returns Relative path
 */
export function getRelativePath(fullPath: string, baseDir: string): string {
  return path.relative(baseDir, fullPath);
}

/**
 * Get directory name from path level.
 * Example: 'contracts/facets/layer_1/AccessControl.sol' with level 2 returns 'features'
 *
 * @param filePath - File path
 * @param level - Directory level (0 = filename, 1 = parent dir, etc.)
 * @returns Directory name at level
 */
export function getPathSegment(filePath: string, level: number): string {
  const segments = filePath.split(path.sep).filter((s) => s.length > 0);
  if (level >= segments.length) {
    return "";
  }
  return segments[segments.length - 1 - level];
}

/**
 * Check if file exists.
 *
 * @param filePath - Path to check
 * @returns true if file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
