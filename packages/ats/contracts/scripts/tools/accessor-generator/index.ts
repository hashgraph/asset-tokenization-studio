#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Accessor Generator — CLI Entry Point
 * Generates EvmAccessors.sol based on isTestMode() configuration
 *
 * Usage:
 *   npx tsx scripts/tools/accessor-generator/index.ts              # Prod mode
 *   ATS_TEST_MODE=true npx tsx scripts/tools/accessor-generator/index.ts  # Test mode
 */

import * as fs from "fs";
import * as path from "path";
import { isTestMode } from "../../infrastructure/config";
import { generate } from "./generator";

async function main(): Promise<void> {
  const testMode = isTestMode();
  const mode = testMode ? "test" : "prod";

  // Output path: contracts/infrastructure/utils/EvmAccessors.sol
  // Resolved relative to this script so the output is deterministic regardless of cwd.
  const outputPath = path.resolve(__dirname, "../../..", "contracts", "infrastructure", "utils", "EvmAccessors.sol");

  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate the Solidity source
  const source = generate(mode, "scripts/tools/accessor-generator/");

  // Write to file
  fs.writeFileSync(outputPath, source, "utf8");

  console.log(`✅ Generated EvmAccessors.sol (${mode} mode)`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Mode: ${mode}`);
  console.log(`   Test: ${testMode}`);
}

main().catch((error) => {
  console.error("❌ Error generating EvmAccessors:", error.message);
  if (process.argv.includes("--verbose") || process.argv.includes("-v")) {
    console.error(error.stack);
  }
  process.exit(1);
});
