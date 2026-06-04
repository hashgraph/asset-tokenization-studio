// SPDX-License-Identifier: Apache-2.0
//
// Hardhat task that runs the hash codegen before Solidity compilation.
//
// The codegen rewrites every `bytes32 constant` annotated with
// `/// @custom:hash <kind> <arg>` in-place, so solc sees the literal hex and
// folds it as a compile-time constant. Running it post-compile would defeat
// the purpose.
//
// The task body shells out to `npm run hashes:generate` (workspace-local) to
// keep one entry point (`scripts/codegen/applyHashGen.ts`) shared between the
// CLI and the compile hook — same pattern as `generate-registry`. The root
// alias `ats:contracts:hashes:generate` proxies the same workspace script.

import { task } from "hardhat/config";
import { execSync } from "child_process";

task("generate-hashes", "Rewrite annotated bytes32 constants from the canonical hashGen")
  .addFlag("silent", "Suppress all output unless an error occurs")
  .setAction(async ({ silent }: { silent: boolean }) => {
    if (!silent) {
      console.log("🔐 Generating hash constants...");
    }
    try {
      execSync("npm run hashes:generate", {
        cwd: __dirname + "/..",
        stdio: silent ? "pipe" : "inherit",
      });
    } catch (error) {
      console.error("❌ Hash codegen failed.");
      console.error(error instanceof Error ? error.message : String(error));
      throw error;
    }
  });
