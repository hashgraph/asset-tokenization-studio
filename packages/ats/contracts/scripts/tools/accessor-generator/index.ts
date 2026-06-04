#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Accessor generator — standalone CLI entry point.
 *
 * Generates `EvmAccessors.sol` for the mode implied by `isTestMode()`.
 *
 * Usage:
 *   npx tsx scripts/tools/accessor-generator/index.ts                     # prod mode
 *   ATS_TEST_MODE=true npx tsx scripts/tools/accessor-generator/index.ts  # test mode
 *
 * The Hardhat `generate-evm-accessors` task in `tasks/compile.ts` is the canonical
 * entry point during a normal compile; this CLI is for manual regeneration outside
 * the compile pipeline.
 *
 * @module tools/accessor-generator
 */

import { isTestMode } from "@scripts/infrastructure";
import { writeEvmAccessorsSource } from "./emit";

async function main(): Promise<void> {
  const mode = isTestMode() ? "test" : "prod";
  const outputPath = writeEvmAccessorsSource(mode);
  console.log(`✅ Generated EvmAccessors.sol (${mode} mode)`);
  console.log(`   Output: ${outputPath}`);
}

main().catch((error) => {
  console.error("❌ Error generating EvmAccessors:", error.message);
  if (process.argv.includes("--verbose") || process.argv.includes("-v")) {
    console.error(error.stack);
  }
  process.exit(1);
});
