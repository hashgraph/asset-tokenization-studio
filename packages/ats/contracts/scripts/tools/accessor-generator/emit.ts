// SPDX-License-Identifier: Apache-2.0

/**
 * Writes the generated `EvmAccessors.sol` to its canonical location. Shared by the
 * Hardhat `generate-evm-accessors` task and the standalone CLI so the output path
 * and source-header label live in one place.
 *
 * @module tools/accessor-generator/emit
 */

import * as fs from "fs";
import * as path from "path";
import { generate } from "./generator";

const SOURCE_HEADER_LABEL = "scripts/tools/accessor-generator/";

/** Canonical output location of the generated library (gitignored, regenerated on compile). */
export const EVM_ACCESSORS_OUTPUT_PATH = path.resolve(
  __dirname,
  "../../..",
  "contracts",
  "infrastructure",
  "utils",
  "EvmAccessors.sol",
);

/**
 * Generate `EvmAccessors.sol` for the given mode and write it to its canonical path.
 *
 * @param mode "prod" (native opcodes only) or "test" (ERC-7201 override storage).
 * @returns The absolute path written.
 */
export function writeEvmAccessorsSource(mode: "prod" | "test"): string {
  fs.mkdirSync(path.dirname(EVM_ACCESSORS_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(EVM_ACCESSORS_OUTPUT_PATH, generate(mode, SOURCE_HEADER_LABEL), "utf8");
  return EVM_ACCESSORS_OUTPUT_PATH;
}
