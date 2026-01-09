#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Generation Tool - Main Entry Point
 *
 * Scans the contracts/ directory and automatically generates a complete
 * facet and contract registry with metadata.
 *
 * This script now uses the new generateRegistryPipeline function,
 * demonstrating how downstream projects can easily generate their own registries.
 *
 * Usage:
 *   npm run generate:registry
 *   npm run generate:registry -- --dry-run
 *   npm run generate:registry -- --output path/to/output.ts
 *
 * @module tools/generateRegistry
 */

import * as path from "path";

// IMPORTANT: Use relative import here (NOT '@scripts/infrastructure')
// Reason: ts-node cannot resolve TypeScript path aliases at runtime.
// Path aliases work after compilation (tsc + tsc-alias), but this script
// runs directly with ts-node during the build process.
import { generateRegistryPipeline } from "../infrastructure/operations/generateRegistryPipeline";

/**
 * CLI options.
 */
interface CliOptions {
  /** Dry run - don't write file */
  dryRun: boolean;

  /** Output file path */
  output: string;

  /** Verbose logging */
  verbose: boolean;

  /** Only generate facets (skip infrastructure) */
  facetsOnly: boolean;
}

/**
 * Parse command line arguments.
 *
 * @returns Parsed options
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);

  const outputIndex = args.indexOf("--output");
  const hasOutput = outputIndex !== -1 && outputIndex + 1 < args.length;

  return {
    dryRun: args.includes("--dry-run"),
    output: hasOutput ? args[outputIndex + 1] : "scripts/domain/atsRegistry.data.ts",
    verbose: args.includes("--verbose") || args.includes("-v"),
    facetsOnly: args.includes("--facets-only"),
  };
}

/**
 * Main execution.
 *
 * Now uses the new generateRegistryPipeline function - demonstrating
 * how downstream projects can easily generate their own registries.
 */
async function main(): Promise<void> {
  const options = parseArgs();

  // Determine log level
  const logLevelStr = process.env.LOG_LEVEL || (options.verbose ? "DEBUG" : "INFO");

  // Use the new pipeline function!
  const result = await generateRegistryPipeline(
    {
      contractsPath: path.join(__dirname, "../../contracts"),
      artifactPath: path.join(__dirname, "../../artifacts/contracts"),
      outputPath: options.output,
      facetsOnly: options.facetsOnly,
      logLevel: logLevelStr as any,
      // Override excludePaths to include testTimeTravel but exclude other test folders
      excludePaths: [
        "**/test/**",
        "!**/test/testTimeTravel/**", // Include testTimeTravel (negation pattern)
        "**/tests/**",
        "**/mocks/**",
        "**/mock/**",
        "**/*.t.sol",
        "**/*.s.sol",
      ],
    },
    !options.dryRun, // Write file unless dry run
  );

  // Show preview for dry runs
  if (options.dryRun && options.verbose) {
    console.log("\nGenerated code preview:");
    console.log("─".repeat(80));
    console.log(result.code.split("\n").slice(0, 50).join("\n"));
    console.log("...");
    console.log("─".repeat(80));
  }
}

// Execute
main().catch((error) => {
  console.error("❌ Error:", error.message);
  if (process.argv.includes("--verbose") || process.argv.includes("-v")) {
    console.error(error.stack);
  }
  process.exit(1);
});
