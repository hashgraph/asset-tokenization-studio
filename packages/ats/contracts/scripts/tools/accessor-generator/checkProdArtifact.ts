// SPDX-License-Identifier: Apache-2.0

/**
 * CI gate — assert the PRODUCTION `EvmAccessors.sol` carries zero test-override machinery.
 *
 * Run after `ATS_TEST_MODE=false hardhat compile`. The compile itself is the primary
 * leak detector: if the `testAccessors` source-path filter regressed and the writer facet
 * leaked into the prod graph, the prod `EvmAccessors` library exposes no override writers,
 * so the facet would fail to resolve them and the compile would error out before reaching
 * here. This script then asserts the emitted prod source is the bare native-opcode variant —
 * no override struct, slot constant, assembly, or readers/writers.
 *
 * Exits non-zero with a GitHub Actions `::error::` annotation on any violation.
 *
 * @module tools/accessor-generator/checkProdArtifact
 */

import * as fs from "fs";
import { EVM_ACCESSORS_OUTPUT_PATH } from "./emit";
import { STORAGE_STRUCT, STORAGE_LOCATION_CONSTANT, overrideReaderName, writerName } from "./generator";
import { ACCESSORS } from "./manifest";

function fail(message: string): never {
  console.error(`::error::${message}`);
  process.exit(1);
}

if (!fs.existsSync(EVM_ACCESSORS_OUTPUT_PATH)) {
  fail(
    `Generated EvmAccessors.sol not found at ${EVM_ACCESSORS_OUTPUT_PATH}. Run \`ATS_TEST_MODE=false hardhat compile\` first.`,
  );
}

const source = fs.readFileSync(EVM_ACCESSORS_OUTPUT_PATH, "utf8");

// 1. No override-storage machinery may appear in the production artifact.
const forbidden: ReadonlyArray<readonly [string, string]> = [
  [STORAGE_STRUCT, "override storage struct"],
  [STORAGE_LOCATION_CONSTANT, "override storage-location constant"],
  ["assembly", "inline assembly (the storage-slot accessor is test-only)"],
  ["@custom:storage-location", "ERC-7201 storage annotation"],
];
for (const [needle, description] of forbidden) {
  if (source.includes(needle)) {
    fail(
      `Prod EvmAccessors.sol contains ${description} ("${needle}") — test-override machinery leaked into the production artifact.`,
    );
  }
}

// 2. No per-accessor override reader/writer may be declared in prod.
for (const accessor of ACCESSORS) {
  for (const name of [overrideReaderName(accessor.name), writerName(accessor.name)]) {
    if (source.includes(`function ${name}`)) {
      fail(
        `Prod EvmAccessors.sol declares override function "${name}" — test-override machinery leaked into the production artifact.`,
      );
    }
  }
}

// 3. Every accessor must still be present as a bare native-opcode getter.
for (const accessor of ACCESSORS) {
  if (!source.includes(`function ${accessor.name}()`) || !source.includes(`return ${accessor.nativeExpression};`)) {
    fail(
      `Prod EvmAccessors.sol is missing the bare getter for "${accessor.name}" (expected \`return ${accessor.nativeExpression};\`).`,
    );
  }
}

// Informational (P1.3): the prod variant is pure native opcodes — no override slot to read.
console.log(
  `✅ Prod EvmAccessors.sol is clean: ${ACCESSORS.length} native-opcode getters, ` +
    `0 override slots, 0 readers/writers (${source.length} bytes).`,
);
