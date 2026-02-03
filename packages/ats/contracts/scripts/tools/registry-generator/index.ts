#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Generation Tool - Standalone CLI Entry Point
 *
 * This is a FAST, standalone version of the registry generator that
 * avoids the 6+ second TypeChain barrel import overhead.
 *
 * Usage:
 *   npm run generate:registry
 *   npm run generate:registry -- --dry-run
 *   npm run generate:registry -- --output path/to/output.ts
 *
 * @module registry-generator
 */

import * as path from "path";
import { generateRegistryPipeline } from "./pipeline";

interface CliOptions {
  dryRun: boolean;
  output: string;
  verbose: boolean;
  facetsOnly: boolean;
  useCache: boolean;
  clearCache: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);

  const outputIndex = args.indexOf("--output");
  const hasOutput = outputIndex !== -1 && outputIndex + 1 < args.length;

  return {
    dryRun: args.includes("--dry-run"),
    output: hasOutput ? args[outputIndex + 1] : "scripts/domain/atsRegistry.data.ts",
    verbose: args.includes("--verbose") || args.includes("-v"),
    facetsOnly: args.includes("--facets-only"),
    useCache: args.includes("--use-cache") || args.includes("--cache"),
    clearCache: args.includes("--clear-cache"),
  };
}

async function main(): Promise<void> {
  const options = parseArgs();

  // Handle --clear-cache before running
  if (options.clearCache) {
    const { CacheManager } = await import("./cache/manager");
    const cache = new CacheManager(process.cwd());
    cache.clear();
    cache.save();
    console.log("[INFO] Cache cleared");
    if (!options.useCache) {
      // Just clear, don't generate
      return;
    }
  }

  const logLevel = process.env.LOG_LEVEL || (options.verbose ? "DEBUG" : "INFO");

  const result = await generateRegistryPipeline(
    {
      contractsPath: path.join(__dirname, "../../../contracts"),
      artifactPath: path.join(__dirname, "../../../artifacts/contracts"),
      outputPath: options.output,
      facetsOnly: options.facetsOnly,
      logLevel: logLevel as any,
      useCache: options.useCache,
      cacheDir: process.cwd(),
      excludePaths: [
        "**/test/**",
        "!**/test/testTimeTravel/**",
        "**/tests/**",
        "**/mocks/**",
        "**/mock/**",
        "**/*.t.sol",
        "**/*.s.sol",
      ],
    },
    !options.dryRun,
  );

  if (options.dryRun && options.verbose) {
    console.log("\nGenerated code preview:");
    console.log("─".repeat(80));
    console.log(result.code.split("\n").slice(0, 50).join("\n"));
    console.log("...");
    console.log("─".repeat(80));
  }
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  if (process.argv.includes("--verbose") || process.argv.includes("-v")) {
    console.error(error.stack);
  }
  process.exit(1);
});
