// SPDX-License-Identifier: Apache-2.0

import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";

task(TASK_COMPILE, "🛠  Compile and regenerate the contract registry.", async function (taskArguments, hre, runSuper) {
  // Hash codegen MUST run before solc so the rewritten hex is folded as a
  // compile-time constant. Running it after compile would emit the new hex
  // but leave the bytecode pointing at the previous values.
  await hre.run("generate-hashes", { silent: true });

  await runSuper(taskArguments);

  // Generate registry after successful compilation
  // This ensures the registry always reflects the latest contract state
  // Use --silent flag to minimize output during compilation
  await hre.run("generate-registry", { silent: true });
});
