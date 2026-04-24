// SPDX-License-Identifier: Apache-2.0

/**
 * Solidity Code Generator for EvmAccessors Library
 * Generates either prod-mode (native opcodes only) or test-mode (with overrides)
 * based on the accessor manifest.
 */

import { ACCESSORS, overrideReaderName, writerName, slotLabel } from "./manifest";

/**
 * Generate the full Solidity source for EvmAccessors.sol
 * @param mode "prod" (native opcodes only) or "test" (with override readers/writers)
 * @param sourcePathForHeader The source path for the auto-generated header comment
 * @returns Complete Solidity library source
 */
export function generate(
  mode: "prod" | "test",
  sourcePathForHeader: string = "scripts/tools/accessor-generator/",
): string {
  const isTest = mode === "test";

  // Auto-generated header (mirrors the pattern from tasks/compile.ts)
  const header = [
    "// AUTO-GENERATED — DO NOT EDIT.",
    `// Source: ${sourcePathForHeader}`,
    "// Regenerated on every `npx hardhat compile` by the",
    "// `generate-evm-accessors` subtask in `tasks/compile.ts`.",
    "// Edits to this file will be silently overwritten.",
  ].join("\n");

  const pragma = "pragma solidity >=0.8.0 <0.9.0;";
  const libStart = "library EvmAccessors {";
  const libEnd = "}";

  // --- Slot definitions (test mode only) ---
  let slots = "";
  if (isTest) {
    slots = ACCESSORS.map(
      (acc) => `    bytes32 private constant _SLOT_${acc.name} =\n` + `        keccak256("${slotLabel(acc.name)}");`,
    ).join("\n\n");
    slots = slots + "\n";
  }

  // --- Getter functions (all modes) ---
  const getters = ACCESSORS.map((acc) => {
    if (isTest) {
      // Test mode: slot fallback with sentinel check
      return (
        `    function ${acc.name}() internal view returns (${acc.type} v_) {\n` +
        `        bytes32 slot = _SLOT_${acc.name};\n` +
        `        // solhint-disable-next-line no-inline-assembly\n` +
        `        assembly { v_ := sload(slot) }\n` +
        `        return v_ == ${acc.sentinel} ? ${acc.native} : v_;\n` +
        `    }`
      );
    } else {
      // Prod mode: direct native opcode
      return (
        `    function ${acc.name}() internal view returns (${acc.type}) {\n` +
        `        return ${acc.native};\n` +
        `    }`
      );
    }
  }).join("\n\n");

  // --- Override readers (test mode only) ---
  let overrideReaders = "";
  if (isTest) {
    overrideReaders =
      "\n\n" +
      ACCESSORS.map((acc) => {
        const readerName = overrideReaderName(acc.name);
        return (
          `    function ${readerName}() internal view returns (${acc.type} v_) {\n` +
          `        bytes32 slot = _SLOT_${acc.name};\n` +
          `        // solhint-disable-next-line no-inline-assembly\n` +
          `        assembly { v_ := sload(slot) }\n` +
          `    }`
        );
      }).join("\n\n");
  }

  // --- Writers (test mode only) ---
  let writers = "";
  if (isTest) {
    writers =
      "\n\n" +
      ACCESSORS.map((acc) => {
        const wName = writerName(acc.name);
        return (
          `    function ${wName}(${acc.type} value) internal {\n` +
          `        bytes32 slot = _SLOT_${acc.name};\n` +
          `        // solhint-disable-next-line no-inline-assembly\n` +
          `        assembly { sstore(slot, value) }\n` +
          `    }`
        );
      }).join("\n\n");
  }

  // --- Assemble the full source ---
  const parts: string[] = ["// SPDX-License-Identifier: Apache-2.0", "", header, "", pragma, "", libStart];

  if (slots) {
    parts.push(slots);
  }

  parts.push(getters);

  if (isTest) {
    if (overrideReaders) {
      parts.push(overrideReaders);
    }
    if (writers) {
      parts.push(writers);
    }
  }

  parts.push(libEnd);

  return parts.join("\n");
}
