// SPDX-License-Identifier: Apache-2.0

import { task } from "hardhat/config";
import { execSync } from "child_process";

/**
 * Hardhat task to generate the contract registry.
 *
 * This task wraps the standalone registry generation tool and integrates it
 * into the Hardhat build process. It's automatically run after compilation
 * to ensure the registry stays in sync with contract changes.
 *
 * Usage:
 *   npx hardhat generate-registry              # Full output
 *   npx hardhat generate-registry --silent     # Minimal output
 *
 * The task executes the registry generation script which:
 * - Scans all contracts in the contracts/ directory
 * - Extracts metadata (methods, events, errors, resolver keys)
 * - Generates TypeScript registry file with type-safe definitions
 * - Deduplicates events/errors from base classes
 *
 * When called during compilation, uses WARN log level to show only
 * the final result. When called manually, shows full detailed output.
 *
 * @see scripts/tools/registry-generator/index.ts for the standalone implementation
 */
task("generate-registry", "Generate contract registry from Solidity source files")
  .addFlag("silent", "Minimal output (only show final result)")
  .setAction(async (taskArgs, hre) => {
    console.log("📋 Generating contract registry...");
    const startTime = performance.now();

    try {
      // Execute the registry generation script
      // Set LOG_LEVEL environment variable to control output verbosity
      const env = {
        ...process.env,
        LOG_LEVEL: taskArgs.silent ? "WARN" : "INFO",
      };

      execSync("npm run generate:registry", {
        stdio: "inherit",
        cwd: hre.config.paths.root,
        env,
      });

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Registry generation completed successfully (${elapsed}s)`);
    } catch (error: unknown) {
      // If registry generation fails, log error but don't fail the build
      // This allows compilation to succeed even if registry generation has issues
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Registry generation failed:", message);
      console.error("Build will continue, but registry may be out of date.");
      console.error('Run "npm run generate:registry" manually to diagnose.');
    }
  });
