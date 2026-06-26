// SPDX-License-Identifier: Apache-2.0

import { TASK_COMPILE, TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS, TASK_TEST } from "hardhat/builtin-tasks/task-names";
import { task, subtask } from "hardhat/config";
import { isTestMode } from "../scripts/infrastructure/config";

task(TASK_COMPILE, "🛠  Compile and regenerate the contract registry.", async function (taskArguments, hre, runSuper) {
  // Regenerate EvmAccessors.sol from the manifest first, so the hash codegen
  // below can stamp the ERC-7201 storage location the test-mode variant declares.
  // Prod mode (default): native-opcode getters only. Test mode (ATS_TEST_MODE=true):
  // getters backed by an ERC-7201 override storage struct, plus readers/writers.
  await hre.run("generate-evm-accessors");

  // Hash codegen MUST run before solc so the stamped hex is folded as a
  // compile-time constant; running it after compile would emit the new hex but
  // leave the bytecode pointing at the previous values.
  await hre.run("generate-hashes", { silent: true });

  await runSuper(taskArguments);

  // Generate registry after successful compilation
  // This ensures the registry always reflects the latest contract state
  // Use --silent flag to minimize output during compilation
  await hre.run("generate-registry", { silent: true });
});

/**
 * Skip the redundant compile that `hardhat coverage` would otherwise do.
 *
 * solidity-coverage compiles the instrumented sources itself (its own `env.run(TASK_COMPILE)`),
 * then runs `env.run(TASK_TEST)` — and Hardhat's TASK_TEST compiles AGAIN as a dependency. That
 * second pass is a full ~60s instrumented solc rebuild per coverage shard for no benefit: the
 * instrumented artifacts already exist from solidity-coverage's own compile. Force `noCompile` for
 * the test phase of a coverage run, leaving the instrumented build untouched and the measured
 * coverage identical.
 *
 * Gate on solidity-coverage's own `__SOLIDITY_COVERAGE_RUNNING` flag (set to `true` on the HRE for
 * the duration of `hardhat coverage` — see solidity-coverage's `plugins/hardhat.plugin.js`) rather
 * than our `COVERAGE` env var: the flag is authoritative — true only during a real coverage run, so
 * a stray `COVERAGE=true` in the environment can't make a plain `hardhat test` skip compilation and
 * run stale artifacts — and if the internal flag ever disappears the worst case is the redundant
 * compile returning (a perf regression, not a correctness bug).
 *
 * Part of the coverage-shard pipeline — see scripts/tools/coverage-shard/README.md.
 */
task(TASK_TEST).setAction(async (args, hre, runSuper) => {
  const coverageRunning = (hre as { __SOLIDITY_COVERAGE_RUNNING?: boolean }).__SOLIDITY_COVERAGE_RUNNING === true;
  if (coverageRunning) {
    return runSuper({ ...args, noCompile: true });
  }
  return runSuper(args);
});

/**
 * Exclude the EvmAccessorsFacet writer directory from prod compiles. In prod mode
 * the generated EvmAccessors.sol exposes getters only, so the facet's override
 * writers would not resolve; keeping it out of the source graph is what lets the
 * prod artifact stay free of any test-override machinery.
 */
subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(async (_, __, runSuper) => {
  const paths = await runSuper();
  if (!isTestMode()) {
    return paths.filter((p: string) => !p.includes("/test/testAccessors/"));
  }
  return paths;
});

/**
 * Regenerate contracts/infrastructure/utils/EvmAccessors.sol from the manifest.
 * Mode is selected by isTestMode() (wraps Configuration.isTestMode, which reads
 * ATS_TEST_MODE). Prod mode emits getters that inline a single native opcode;
 * test mode emits getters backed by an ERC-7201 override storage struct, plus
 * per-accessor override readers and writers. Delegates to the shared emit module.
 */
task("generate-evm-accessors", async () => {
  const { writeEvmAccessorsSource } = await import("../scripts/tools/accessor-generator/emit");
  const mode = isTestMode() ? "test" : "prod";
  writeEvmAccessorsSource(mode);
  console.log(`✅ Generated EvmAccessors.sol (${mode} mode)`);
});
