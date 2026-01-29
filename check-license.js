#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

const fs = require("fs");
const path = require("path");

const LICENSE_HEADER = "// SPDX-License-Identifier: Apache-2.0";

/**
 * Check if a file should be excluded from license checking
 * @param {string} filePath - Path to the file to check
 * @returns {boolean} - True if file should be excluded
 */
function shouldExcludeFile(filePath) {
  // Exclude test files
  return (
    filePath.includes(".test.ts") ||
    filePath.includes(".test.tsx") ||
    filePath.includes(".spec.ts") ||
    filePath.includes(".spec.tsx") ||
    filePath.includes("/test/") ||
    filePath.includes("/__tests__/")
  );
}

/**
 * Check if a file contains the required license header
 * @param {string} filePath - Path to the file to check
 * @returns {boolean} - True if license header is present
 */
function checkLicenseHeader(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  // Check first few lines for the exact license header
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line === LICENSE_HEADER) {
      return true;
    }
  }

  return false;
}

/**
 * Main function to check all files passed as arguments
 */
function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.log("No files to check");
    process.exit(0);
  }

  const filesWithoutLicense = [];

  files.forEach((file) => {
    if (shouldExcludeFile(file)) {
      return; // Skip test files
    }

    if (!checkLicenseHeader(file)) {
      filesWithoutLicense.push(file);
    }
  });

  if (filesWithoutLicense.length > 0) {
    console.error("\n❌ The following files are missing the SPDX license header:");
    console.error("   Expected: " + LICENSE_HEADER + "\n");
    filesWithoutLicense.forEach((file) => {
      console.error("   - " + file);
    });
    console.error("\nPlease add the license header to these files.\n");
    process.exit(1);
  }

  console.log("✅ All files have the required license header");
  process.exit(0);
}

main();
