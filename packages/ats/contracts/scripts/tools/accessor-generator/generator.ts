// SPDX-License-Identifier: Apache-2.0

/**
 * Solidity code generator for `EvmAccessors.sol`.
 *
 * Emits one of two variants from the declarative accessor manifest:
 *   - prod: getters that inline the native EVM opcode, with no override machinery;
 *   - test: getters that fall back to an override held in a dedicated ERC-7201
 *     storage struct, plus per-accessor override readers and writers.
 *
 * The test-mode overrides live in a single namespaced storage struct
 * (`EvmAccessorsOverridesDataStorage`) laid out per the project's canonical
 * 5-region ERC-7201 convention, addressed through `STORAGE_LOCATION_EVM_ACCESSORS_OVERRIDES`
 * (stamped by the hash codegen on compile).
 *
 * @module tools/accessor-generator/generator
 */

import { ACCESSORS, AccessorDefinition } from "./manifest";
import { HASHES } from "../../codegen/hashGen";

/**
 * Names of the test-mode override storage symbols. Exported so consumers (tests,
 * downstream tooling) reference a single definition rather than re-typing the
 * literals — keeping any rename in lockstep with the emitted source.
 */
export const STORAGE_STRUCT = "EvmAccessorsOverridesDataStorage";
export const STORAGE_LOCATION_CONSTANT = "STORAGE_LOCATION_EVM_ACCESSORS_OVERRIDES";
export const STORAGE_HASH_NAME = "EvmAccessorsOverrides";
/**
 * ERC-7201 `@custom:storage-location` annotation string.
 *
 * Uses the canonical ATS prefix `asset.tokenization.standard.storage.…` — the same
 * pre-image the codegen hashes in `HASHES.storage(STORAGE_HASH_NAME)`. The annotation
 * is therefore the EXACT pre-image of `STORAGE_LOCATION_EVM_ACCESSORS_OVERRIDES`:
 * `erc7201(STORAGE_NAMESPACE) == evmAccessorsStorageSlot()`. The slot is fixed by the
 * hash, not by this string, so the annotation is verifiable documentation rather than
 * a second source of truth.
 */
export const STORAGE_NAMESPACE = `asset.tokenization.standard.storage.${STORAGE_HASH_NAME}`;
export const STORAGE_REF = "evmAccessorsOverridesStorage";

/**
 * The authoritative ERC-7201 slot the test-mode override store is addressed at:
 * the codegen hash for the namespace. Exposed so callers verify the slot against
 * the single source of truth rather than a copied hex literal.
 */
export const evmAccessorsStorageSlot = (): string => HASHES.storage(STORAGE_HASH_NAME);

/** Accessor base name with the `get` prefix stripped, e.g. `getBlockTimestamp` -> `BlockTimestamp`. */
function pascalBaseName(accessorName: string): string {
  return accessorName.startsWith("get") ? accessorName.slice(3) : accessorName;
}

/** Override reader name, e.g. `getBlockTimestamp` -> `getBlockTimestampOverride`. */
export function overrideReaderName(accessorName: string): string {
  return `${accessorName}Override`;
}

/** Override writer name, e.g. `getBlockTimestamp` -> `setBlockTimestampOverride`. */
export function writerName(accessorName: string): string {
  return `set${pascalBaseName(accessorName)}Override`;
}

/** Storage field name, e.g. `getBlockTimestamp` -> `blockTimestampOverride`. */
export function storageFieldName(accessorName: string): string {
  const base = pascalBaseName(accessorName);
  return `${base.charAt(0).toLowerCase()}${base.slice(1)}Override`;
}

/** Packed scalars (address and small types) belong in region 2; single-slot scalars in region 3. */
function isPackedScalar(accessor: AccessorDefinition): boolean {
  return accessor.solidityType === "address" || accessor.solidityType === "bytes3" || accessor.solidityType === "uint8";
}

const HEADER_LINES = (sourcePath: string): string[] => [
  "// AUTO-GENERATED — DO NOT EDIT.",
  `// Source: ${sourcePath}`,
  "// Regenerated on every `npx hardhat compile` by the",
  "// `generate-evm-accessors` task in `tasks/compile.ts`.",
  "// Edits to this file will be silently overwritten.",
];

function buildOverridesStruct(): string {
  const r2 = ACCESSORS.filter(isPackedScalar);
  const r3 = ACCESSORS.filter((accessor) => !isPackedScalar(accessor));
  const field = (accessor: AccessorDefinition): string =>
    `    ${accessor.solidityType} ${storageFieldName(accessor.name)};`;

  const lines = [
    `/// @custom:hash storage ${STORAGE_HASH_NAME}`,
    // Real slot from the codegen's own formula, matching the value the hash codegen validates on compile.
    `bytes32 constant ${STORAGE_LOCATION_CONSTANT} = ${HASHES.storage(STORAGE_HASH_NAME)};`,
    "",
    `/// @custom:storage-location erc7201:${STORAGE_NAMESPACE}`,
    `struct ${STORAGE_STRUCT} {`,
    "    // ─── R1 Lifecycle (bool flags) ───────────────────────────",
    "    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────",
    ...r2.map(field),
    "    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───",
    ...r3.map(field),
    "    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────",
    "    // ─── APPEND-ONLY ZONE BELOW ───",
    "}",
  ];
  return lines.join("\n");
}

function buildStorageRef(): string {
  return [
    `    function ${STORAGE_REF}() private pure returns (${STORAGE_STRUCT} storage overrides_) {`,
    `        bytes32 position = ${STORAGE_LOCATION_CONSTANT};`,
    "        // solhint-disable-next-line no-inline-assembly",
    "        assembly {",
    "            overrides_.slot := position",
    "        }",
    "    }",
  ].join("\n");
}

function buildGetter(accessor: AccessorDefinition, isTest: boolean): string {
  // Prod inlines the bare native opcode; test falls back to it only on the sentinel.
  if (!isTest) {
    return [
      `    function ${accessor.name}() internal view returns (${accessor.solidityType}) {`,
      `        return ${accessor.nativeExpression};`,
      "    }",
    ].join("\n");
  }
  return [
    `    function ${accessor.name}() internal view returns (${accessor.solidityType} value_) {`,
    `        value_ = ${STORAGE_REF}().${storageFieldName(accessor.name)};`,
    `        return value_ == ${accessor.sentinel} ? ${accessor.nativeExpression} : value_;`,
    "    }",
  ].join("\n");
}

function buildReader(accessor: AccessorDefinition): string {
  return [
    `    function ${overrideReaderName(accessor.name)}() internal view returns (${accessor.solidityType} value_) {`,
    `        value_ = ${STORAGE_REF}().${storageFieldName(accessor.name)};`,
    "    }",
  ].join("\n");
}

function buildWriter(accessor: AccessorDefinition): string {
  return [
    `    function ${writerName(accessor.name)}(${accessor.solidityType} value) internal {`,
    `        ${STORAGE_REF}().${storageFieldName(accessor.name)} = value;`,
    "    }",
  ].join("\n");
}

/**
 * Generate the complete Solidity source for `EvmAccessors.sol`.
 *
 * @param mode "prod" (native opcodes only) or "test" (overrides via ERC-7201 storage).
 * @param sourcePathForHeader Source path recorded in the auto-generated header.
 * @returns The full Solidity source.
 */
export function generate(
  mode: "prod" | "test",
  sourcePathForHeader: string = "scripts/tools/accessor-generator/",
): string {
  const isTest = mode === "test";

  const parts: string[] = [
    "// SPDX-License-Identifier: Apache-2.0",
    "/* solhint-disable */",
    "",
    HEADER_LINES(sourcePathForHeader).join("\n"),
    "",
    "pragma solidity >=0.8.0 <0.9.0;",
    "",
  ];

  if (isTest) {
    parts.push(buildOverridesStruct(), "");
  }

  parts.push("library EvmAccessors {");

  const members: string[] = ACCESSORS.map((accessor) => buildGetter(accessor, isTest));
  if (isTest) {
    members.push(...ACCESSORS.map(buildReader), ...ACCESSORS.map(buildWriter), buildStorageRef());
  }

  parts.push(members.join("\n\n"), "}");

  return parts.join("\n");
}
