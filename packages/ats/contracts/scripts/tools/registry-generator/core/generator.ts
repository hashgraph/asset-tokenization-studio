// SPDX-License-Identifier: Apache-2.0

/**
 * Generate TypeScript registry code from contract metadata.
 *
 * Transforms extracted contract metadata into complete TypeScript registry files
 * with all contracts, methods, events, errors, and roles. Self-contained with no
 * external infrastructure dependencies.
 *
 * @module registry-generator/core/generator
 */

import * as fs from "fs";
import * as path from "path";
import type { ContractMetadata, MethodDefinition, EventDefinition, ErrorDefinition } from "../types";
import { REVERSE_LIBRARY_KEYS } from "../../../domain/orchestratorLibraries";

/**
 * Reverse mapping from Hardhat linkReferences key format to short library name.
 * Re-exports `REVERSE_LIBRARY_KEYS` from `scripts/domain/orchestratorLibraries.ts`
 * so the generator and the deployment registry share a single source of truth
 * for orchestrator library identities. Adding a new library only requires
 * updating `LIBRARY_KEYS` in that module.
 */
const LINK_REF_TO_LIB_NAME: Record<string, string> = REVERSE_LIBRARY_KEYS;

/**
 * Read Hardhat artifact and extract library dependencies.
 *
 * Checks the artifact's `linkReferences` field to determine which orchestrator
 * libraries a facet needs linked at deployment time.
 *
 * @param facetName - Contract name (e.g., "BondUSAFacet")
 * @param sourceFile - Relative path to source file (e.g., "contracts/facets/regulation/bondUSA/variableRate/BondUSAFacet.sol")
 * @returns Array of library short names (e.g., ["tokenCoreOps"]) or empty array
 */
function getLibraryDependencies(facetName: string, sourceFile: string): string[] {
  const artifactPath = path.join("artifacts", "contracts", sourceFile, `${facetName}.json`);
  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const linkRefs: Record<string, Record<string, unknown[]>> = artifact.linkReferences || {};
    const libs: string[] = [];
    for (const [filePath, refs] of Object.entries(linkRefs)) {
      for (const libName of Object.keys(refs)) {
        const key = `${filePath}:${libName}`;
        const mapped = LINK_REF_TO_LIB_NAME[key];
        if (mapped) {
          libs.push(mapped);
        }
      }
    }
    return libs.sort();
  } catch {
    return [];
  }
}

// Cache library dependencies to avoid re-reading artifacts
const _libDepsCache = new Map<string, string[]>();

function getCachedLibDeps(facetName: string, sourceFile: string): string[] {
  if (!_libDepsCache.has(facetName)) {
    _libDepsCache.set(facetName, getLibraryDependencies(facetName, sourceFile));
  }
  return _libDepsCache.get(facetName)!;
}

/**
 * Format methods array for registry output.
 * Prettier will handle final formatting.
 *
 * @param methods - Array of method definitions
 * @returns Methods array as JavaScript object
 */
function formatMethods(methods: MethodDefinition[]): string {
  return JSON.stringify(methods);
}

/**
 * Format events array for registry output.
 * Prettier will handle final formatting.
 *
 * @param events - Array of event definitions
 * @returns Events array as JavaScript object
 */
function formatEvents(events: EventDefinition[]): string {
  return JSON.stringify(events);
}

/**
 * Format errors array for registry output.
 * Prettier will handle final formatting.
 *
 * @param errors - Array of error definitions
 * @returns Errors array as JavaScript object
 */
function formatErrors(errors: ErrorDefinition[]): string {
  return JSON.stringify(errors);
}

/**
 * Normalize role value to proper bytes32 format.
 *
 * Ensures role values are proper 66-character hex strings (0x + 64 hex chars).
 * Solidity allows shorthand like `0x00` for bytes32(0), but TypeScript/ethers.js
 * requires the full format.
 *
 * @param value - Role value from Solidity (may be shorthand like '0x00')
 * @returns Normalized bytes32 string (66 characters)
 */
function normalizeRoleValue(value: string): string {
  // Remove '0x' prefix if present
  const hexValue = value.startsWith("0x") ? value.slice(2) : value;
  // Pad to 64 characters (32 bytes)
  const paddedValue = hexValue.padStart(64, "0");
  // Return with '0x' prefix
  return `0x${paddedValue}`;
}

/**
 * Derive the camelCase dot-access alias for a facet name.
 *
 * Strips the trailing `Facet` suffix and camelCases the remainder, collapsing
 * acronym runs (e.g. `ERC20VotesFacet` -> `erc20Votes`, `EIP712Facet` ->
 * `eip712`, `AccessControlFacet` -> `accessControl`). The aliases are the keys
 * of the generated `FACET_KEYS` map and, transitively, of the `FACETS` /
 * `RESOLVER_KEYS` accessors in `scripts/domain/atsRegistry.ts`.
 *
 * @param name - Facet contract name (e.g. `"AccessControlFacet"`).
 * @returns camelCase alias (e.g. `"accessControl"`).
 */
function toFacetKey(name: string): string {
  const base = name.replace(/Facet$/, "");
  const tokens = base.match(/[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+[0-9]*|[A-Z]+[0-9]*|[0-9]+/g) ?? [base];
  return tokens
    .map((token, index) =>
      index === 0 ? token.toLowerCase() : token.charAt(0).toUpperCase() + token.slice(1).toLowerCase(),
    )
    .join("");
}

/**
 * Generate complete registry TypeScript code.
 *
 * @param facets - Array of facet metadata
 * @param infrastructure - Array of infrastructure contract metadata
 * @param allRoles - Optional map of all roles (from contracts and standalone files)
 * @param storageWrappers - Optional array of storage wrapper metadata
 * @param mocks - Optional array of mock contract metadata
 * @param moduleName - Optional module name for imports (default: '@scripts/infrastructure')
 * @param typechainModuleName - Optional TypeChain factory import path (default: '@contract-types')
 * @returns TypeScript source code
 */
export function generateRegistry(
  facets: ContractMetadata[],
  infrastructure: ContractMetadata[],
  allRoles?: Map<string, string>,
  storageWrappers?: ContractMetadata[],
  mocks?: ContractMetadata[],
  moduleName: string = "@scripts/infrastructure",
  typechainModuleName: string = "@contract-types",
): string {
  const header = generateHeader(
    facets.length,
    infrastructure.length,
    mocks?.length ?? 0,
    moduleName,
    facets,
    typechainModuleName,
    mocks,
  );
  const facetRegistry = generateFacetRegistry(facets);
  const facetNameUnion = generateFacetNameUnion(facets);
  const facetKeysMap = generateFacetKeysMap(facets);
  const contractRegistry = generateContractRegistry(infrastructure);
  const storageWrapperRegistry = storageWrappers ? generateStorageWrapperRegistry(storageWrappers) : "";
  const mockRegistry = mocks && mocks.length > 0 ? generateMockRegistry(mocks) : "";

  /**
   * @remarks
   * The `ROLES` constant is intentionally emitted into a separate file via
   * `generateRolesFile` (see BBND-1766). Keeping the heavy facet/contract
   * registries decoupled from the small, audit-relevant `ROLES` map lets the
   * roles file remain checked into git while the rest of this file is
   * gitignored and regenerated on `prepare`.
   */
  const registries = [header, facetRegistry, facetNameUnion, facetKeysMap, contractRegistry];
  if (storageWrapperRegistry) {
    registries.push(storageWrapperRegistry);
  }
  if (mockRegistry) {
    registries.push(mockRegistry);
  }

  // ROLES are emitted by `generateRolesFile` below; do not append here.
  void allRoles;

  return registries.join("\n\n") + "\n";
}

/**
 * Generate the dedicated `atsRoles.generated.ts` file.
 *
 * @remarks
 * Emits a standalone TypeScript module that exports only the deduplicated
 * `ROLES` map (and the matching `TOTAL_ROLES` count). Kept in a separate file
 * — and checked into git — so that:
 *
 * - The `scripts/domain/constants.ts` bootstrap import resolves on a fresh
 *   clone, even when the (gitignored) heavy `atsRegistry.generated.ts` is not
 *   yet generated. See BBND-1766 for the architectural rationale.
 * - Role-hash changes are visible in PR diffs and audit trails. A ~50-line
 *   roles file produces meaningful review noise; burying it inside a 14k-line
 *   auto-generated blob does not.
 *
 * The body is produced by the same `generateConstants` helper used previously
 * — only the wrapping file header is new — so role-name ordering and value
 * formatting remain byte-identical to the legacy single-file output.
 *
 * @param facets - Array of facet metadata.
 * @param infrastructure - Array of infrastructure contract metadata.
 * @param allRoles - Optional pre-collected, deduplicated roles map.
 * @returns Complete TypeScript source for the roles file (incl. file header).
 */
export function generateRolesFile(
  facets: ContractMetadata[],
  infrastructure: ContractMetadata[],
  allRoles?: Map<string, string>,
): string {
  const body = generateConstants(facets, infrastructure, allRoles);

  const header = `// SPDX-License-Identifier: Apache-2.0

/**
 * @file atsRoles.generated.ts
 * @generated DO NOT EDIT MANUALLY - regenerated by \`npm run generate:registry\`.
 *
 * @remarks
 * AUTO-GENERATED role hash registry. Split out of \`atsRegistry.generated.ts\`
 * per BBND-1766 so this small, audit-relevant surface can stay checked into
 * git while the heavy facet/contract registry is gitignored.
 *
 * To regenerate: \`npm run generate:registry\` (or any \`hardhat compile\`).
 *
 * Import from \`@scripts/domain\` instead of this file directly.
 *
 * @module domain/atsRoles.generated
 */
`;

  return `${header}\n${body}\n`;
}

/**
 * Generate file header with imports and comments.
 *
 * @param facetCount - Number of facets
 * @param infrastructureCount - Number of infrastructure contracts
 * @param mockCount - Number of mock contracts
 * @param moduleName - Module name for imports
 * @param facets - Array of facet metadata for factory imports
 * @param typechainModuleName - TypeChain factory import path
 * @param mocks - Optional array of mock contract metadata for factory imports
 * @returns Header code
 */
function generateHeader(
  facetCount: number,
  infrastructureCount: number,
  mockCount: number,
  moduleName: string = "@scripts/infrastructure",
  facets: ContractMetadata[] = [],
  typechainModuleName: string = "@contract-types",
  mocks?: ContractMetadata[],
): string {
  const mockLine = mockCount > 0 ? `\n * Mocks: ${mockCount}` : "";

  // Sort facet names alphabetically for deterministic output. Only deployable
  // facets are imported; abstract contracts and interfaces have no factory
  // reference in the generated body, so importing their __factory would leave
  // an unused symbol that fails the no-unused-imports lint rule.
  const sortedFacetNames = facets
    .filter((f) => f.isDeployable)
    .map((f) => f.name)
    .sort();

  // Generate TypeChain factory imports (Prettier will format)
  const factoryImports: string[] = [];
  for (const name of sortedFacetNames) {
    factoryImports.push(`${name}__factory`);
  }

  // Include mock contract factory imports (only deployable mocks)
  if (mocks && mocks.length > 0) {
    const deployableMocks = mocks.filter((m) => m.isDeployable);
    const sortedMockNames = [...deployableMocks].map((m) => m.name).sort();
    for (const name of sortedMockNames) {
      factoryImports.push(`${name}__factory`);
    }
  }

  const factoryImportsStr = factoryImports.join(", ");

  // Check if any facets have library dependencies
  const hasAnyLibDeps = facets.some((f) => getCachedLibDeps(f.name, f.sourceFile).length > 0);
  const libLinksImport = hasAnyLibDeps ? `\nimport { getLibLinks } from './orchestratorLibraries'` : "";

  return `// SPDX-License-Identifier: Apache-2.0

/**
 * AUTO-GENERATED Contract Registry Data
 *
 * This file is automatically generated by the registry generation tool.
 * @generated DO NOT EDIT MANUALLY - Changes will be overwritten.
 *
 * To regenerate: npm run generate:registry
 *
 * Import from '@scripts/domain' instead of this file directly.
 *
 * Generated: ${new Date().toISOString()}
 * Facets: ${facetCount}
 * Infrastructure: ${infrastructureCount}${mockLine}
 *
 * @module domain/atsRegistry.generated
 */

import { FacetDefinition, ContractDefinition, StorageWrapperDefinition } from '${moduleName}'
import { ${factoryImportsStr} } from '${typechainModuleName}'${libLinksImport}`;
}

/**
 * Generate FACET_REGISTRY constant.
 *
 * @param facets - Array of facet metadata
 * @returns TypeScript code for FACET_REGISTRY
 */
function generateFacetRegistry(facets: ContractMetadata[]): string {
  // Sort facets alphabetically for deterministic output
  const sortedFacets = [...facets].sort((a, b) => a.name.localeCompare(b.name));

  const entries = sortedFacets.map((facet) => generateFacetEntry(facet));

  return `/**
 * Registry of all facet contracts.
 */
export const FACET_REGISTRY: Record<string, FacetDefinition> = {
${entries.join(",\n\n")}
}

/**
 * Total number of facets in the registry.
 */
export const TOTAL_FACETS = ${facets.length} as const`;
}

/**
 * Generate the `FacetName` string-literal union type.
 *
 * Emits a union of every facet contract name in the registry, sorted
 * alphabetically for deterministic output. Consumers (e.g. deployment
 * configuration facet sets) type their lists as `readonly FacetName[]` so an
 * unknown or mis-typed facet name is a compile error rather than a runtime
 * lookup miss. `keyof typeof FACET_REGISTRY` cannot serve this purpose because
 * the registry is typed `Record<string, FacetDefinition>` and widens its keys
 * to `string`; the explicit literal union preserves the names.
 *
 * Emits `never` when there are no facets so the output is always valid
 * TypeScript (an empty union is a syntax error).
 *
 * @param facets - Array of facet metadata
 * @returns TypeScript code for the FacetName union type
 */
function generateFacetNameUnion(facets: ContractMetadata[]): string {
  const sortedNames = [...facets].map((f) => f.name).sort((a, b) => a.localeCompare(b));

  const body = sortedNames.length > 0 ? sortedNames.map((name) => `    | '${name}'`).join("\n") : "    never";

  return `/**
 * Union of every facet contract name known to the registry.
 *
 * Type the facet-name lists that drive deployment configurations as
 * \`readonly FacetName[]\` so typos and renames surface as compile errors.
 */
export type FacetName =
${body}`;
}

/**
 * Generate the `FACET_KEYS` map: camelCase alias -> facet contract name.
 *
 * Sorted by facet name for deterministic output. `as const` preserves the
 * literal keys and values so consumers can derive `keyof typeof FACET_KEYS`
 * (the camelCase alias union) and so each value narrows to its `FacetName`.
 * `scripts/domain/atsRegistry.ts` builds the `FACETS` and `RESOLVER_KEYS`
 * dot-access accessors on top of this map.
 *
 * @param facets - Array of facet metadata
 * @returns TypeScript code for the FACET_KEYS constant
 */
function generateFacetKeysMap(facets: ContractMetadata[]): string {
  const sortedNames = [...facets].map((f) => f.name).sort((a, b) => a.localeCompare(b));

  const entries = sortedNames.map((name) => `    ${toFacetKey(name)}: '${name}',`).join("\n");

  return `/**
 * Map of camelCase facet alias to facet contract name.
 *
 * Drives the \`FACETS\` and \`RESOLVER_KEYS\` dot-access accessors in
 * \`scripts/domain/atsRegistry.ts\`; \`keyof typeof FACET_KEYS\` is the alias union.
 */
export const FACET_KEYS = {
${entries}
} as const`;
}

/**
 * Generate single facet registry entry.
 *
 * Includes resolver key object, role count, inheritance, methods, events, and errors.
 * Provides metadata useful for deployment verification and documentation.
 *
 * @param facet - Facet metadata
 * @returns TypeScript object literal
 */
function generateFacetEntry(facet: ContractMetadata): string {
  const resolverKeyLine = facet.resolverKey
    ? `\n        resolverKey: {\n            name: '${facet.resolverKey.name}',\n            value: '${facet.resolverKey.value}'\n        },`
    : "";

  const rolesLine = facet.roles.length > 0 ? `\n        roleCount: ${facet.roles.length},` : "";

  const inheritanceLine =
    facet.inheritance.length > 0 ? `\n        inheritance: ${JSON.stringify(facet.inheritance)},` : "";

  const methodsLine = facet.methods.length > 0 ? `\n        methods: ${formatMethods(facet.methods)},` : "";

  const eventsLine = facet.events.length > 0 ? `\n        events: ${formatEvents(facet.events)},` : "";

  const errorsLine = facet.errors.length > 0 ? `\n        errors: ${formatErrors(facet.errors)},` : "";

  const descriptionLine = facet.description ? `\n        description: '${facet.description}',` : "";

  // Add TypeChain factory reference (only for deployable contracts)
  // Abstract contracts (isDeployable: false) don't have constructors in their factories
  let factoryLine: string;

  if (!facet.isDeployable) {
    // Abstract contracts - no factory constructor, only static methods
    factoryLine = "";
  } else {
    // Deployable contracts - generate factory code
    const libDeps = getCachedLibDeps(facet.name, facet.sourceFile);
    if (libDeps.length > 0) {
      const libArgs = libDeps.map((l) => `"${l}"`).join(", ");
      factoryLine = `\n        factory: (signer) => new ${facet.name}__factory(getLibLinks(${libArgs}) as any, signer),`;
    } else {
      factoryLine = `\n        factory: (signer) => new ${facet.name}__factory(signer),`;
    }
  }

  return `    ${facet.name}: {
        name: '${facet.name}',${descriptionLine}${resolverKeyLine}${rolesLine}${inheritanceLine}${methodsLine}${eventsLine}${errorsLine}${factoryLine}
    }`;
}

/**
 * Generate INFRASTRUCTURE_CONTRACTS constant.
 *
 * @param infrastructure - Array of infrastructure contract metadata
 * @returns TypeScript code for INFRASTRUCTURE_CONTRACTS
 */
function generateContractRegistry(infrastructure: ContractMetadata[]): string {
  const sortedContracts = [...infrastructure].sort((a, b) => a.name.localeCompare(b.name));

  const entries = sortedContracts.map((contract) => generateContractEntry(contract));

  return `/**
 * Registry of non-facet infrastructure contracts (BusinessLogicResolver, Factory, etc.).
 * These are core system contracts that are not Diamond facets.
 */
export const INFRASTRUCTURE_CONTRACTS: Record<string, ContractDefinition> = {
${entries.join(",\n\n")}
}

/**
 * Total number of infrastructure contracts in the registry.
 */
export const TOTAL_INFRASTRUCTURE_CONTRACTS = ${infrastructure.length} as const`;
}

/**
 * Generate single contract registry entry.
 *
 * @param contract - Contract metadata
 * @returns TypeScript object literal
 */
function generateContractEntry(contract: ContractMetadata): string {
  const inheritanceLine =
    contract.inheritance.length > 0 ? `\n        inheritance: ${JSON.stringify(contract.inheritance)},` : "";

  const methodsLine = contract.methods.length > 0 ? `\n        methods: ${formatMethods(contract.methods)},` : "";

  const eventsLine = contract.events.length > 0 ? `\n        events: ${formatEvents(contract.events)},` : "";

  const errorsLine = contract.errors.length > 0 ? `\n        errors: ${formatErrors(contract.errors)},` : "";

  const descriptionLine = contract.description ? `\n        description: '${contract.description}',` : "";

  return `    ${contract.name}: {
        name: '${contract.name}',${descriptionLine}${inheritanceLine}${methodsLine}${eventsLine}${errorsLine}
    }`;
}

/**
 * Generate STORAGE_WRAPPER_REGISTRY constant.
 *
 * @param storageWrappers - Array of storage wrapper metadata
 * @returns TypeScript code for STORAGE_WRAPPER_REGISTRY
 */
function generateStorageWrapperRegistry(storageWrappers: ContractMetadata[]): string {
  const sortedWrappers = [...storageWrappers].sort((a, b) => a.name.localeCompare(b.name));

  const entries = sortedWrappers.map((wrapper) => generateStorageWrapperEntry(wrapper));

  return `/**
 * Registry of storage wrapper contracts.
 *
 * StorageWrappers provide internal storage and helper methods for facets.
 * They are abstract contracts inherited by facets, not deployed directly.
 */
export const STORAGE_WRAPPER_REGISTRY: Record<string, StorageWrapperDefinition> = {
${entries.join(",\n\n")}
}

/**
 * Total number of storage wrapper contracts in the registry.
 */
export const TOTAL_STORAGE_WRAPPERS = ${storageWrappers.length} as const`;
}

/**
 * Generate single storage wrapper registry entry.
 *
 * @param wrapper - Storage wrapper metadata
 * @returns TypeScript object literal
 */
function generateStorageWrapperEntry(wrapper: ContractMetadata): string {
  const inheritanceLine =
    wrapper.inheritance.length > 0 ? `\n        inheritance: ${JSON.stringify(wrapper.inheritance)},` : "";

  const eventsLine = wrapper.events.length > 0 ? `,\n        events: ${formatEvents(wrapper.events)}` : "";

  const errorsLine = wrapper.errors.length > 0 ? `,\n        errors: ${formatErrors(wrapper.errors)}` : "";

  const descriptionLine = wrapper.description ? `\n        description: '${wrapper.description}',` : "";

  return `    ${wrapper.name}: {
        name: '${wrapper.name}',${descriptionLine}${inheritanceLine}
        methods: ${formatMethods(wrapper.methods)}${eventsLine}${errorsLine}
    }`;
}

/**
 * Generate MOCK_CONTRACTS registry constant.
 *
 * Mock contracts are test/mock utilities for downstream projects.
 * Uses FacetDefinition to support resolver keys for mock facets.
 *
 * @param mocks - Array of mock contract metadata
 * @returns TypeScript code for MOCK_CONTRACTS
 */
function generateMockRegistry(mocks: ContractMetadata[]): string {
  const sortedMocks = [...mocks].sort((a, b) => a.name.localeCompare(b.name));

  const entries = sortedMocks.map((mock) => generateMockEntry(mock));

  return `/**
 * Registry of mock/test contracts.
 *
 * These contracts are test utilities for downstream projects.
 * Uses FacetDefinition to support resolver keys for mock facets.
 * Not intended for production deployment.
 */
export const MOCK_CONTRACTS: Record<string, FacetDefinition> = {
${entries.join(",\n\n")}
}

/**
 * Total number of mock contracts in the registry.
 */
export const TOTAL_MOCKS = ${mocks.length} as const`;
}

/**
 * Generate single mock contract registry entry.
 *
 * Uses FacetDefinition format to support resolver keys for mock facets.
 * Includes factory property for TypeChain factory instantiation.
 *
 * @param mock - Mock contract metadata
 * @returns TypeScript object literal
 */
function generateMockEntry(mock: ContractMetadata): string {
  const resolverKeyLine = mock.resolverKey
    ? `\n        resolverKey: {\n            name: '${mock.resolverKey.name}',\n            value: '${mock.resolverKey.value}'\n        },`
    : "";

  const inheritanceLine =
    mock.inheritance.length > 0 ? `\n        inheritance: ${JSON.stringify(mock.inheritance)},` : "";

  const methodsLine = mock.methods.length > 0 ? `\n        methods: ${formatMethods(mock.methods)},` : "";

  const eventsLine = mock.events.length > 0 ? `\n        events: ${formatEvents(mock.events)},` : "";

  const errorsLine = mock.errors.length > 0 ? `\n        errors: ${formatErrors(mock.errors)},` : "";

  const descriptionLine = mock.description ? `\n        description: '${mock.description}',` : "";

  // Add TypeChain factory reference (only for deployable mocks)
  const factoryLine = mock.isDeployable ? `\n        factory: (signer) => new ${mock.name}__factory(signer),` : "";

  return `    ${mock.name}: {
        name: '${mock.name}',${descriptionLine}${resolverKeyLine}${inheritanceLine}${methodsLine}${eventsLine}${errorsLine}${factoryLine}
    }`;
}

/**
 * Generate constants section (roles).
 *
 * ROLE DEDUPLICATION STRATEGY:
 * Roles are intentionally defined in multiple Solidity files across the codebase
 * but automatically deduplicated during registry generation. This approach ensures:
 *
 * 1. **Import Independence**: Each contract/facet can import roles from its local
 *    constants file without complex dependency chains
 *
 * 2. **ERC3643 Compatibility**: T-REX standard roles (from external libraries) are
 *    intentionally duplicated in our constants for explicit documentation
 *
 * 3. **Deduplication**: The Map data structure ensures each role name appears only
 *    once in the generated registry, using the first encountered value
 *
 * For example, scanner may find 60+ role definitions across 4 files, but only
 * 28 unique roles end up in the registry (by role name).
 *
 * @param facets - Array of facet metadata
 * @param infrastructure - Array of infrastructure contract metadata
 * @param allRoles - Optional pre-collected roles map
 * @returns TypeScript constants code
 */
function generateConstants(
  facets: ContractMetadata[],
  infrastructure: ContractMetadata[],
  allRoles?: Map<string, string>,
): string {
  // Use provided roles map or collect from contracts
  // Map automatically deduplicates by role name (key)
  const roleMap = allRoles || new Map<string, string>();

  // If no roles provided, collect from contracts
  if (!allRoles) {
    const allContracts = [...facets, ...infrastructure];
    for (const contract of allContracts) {
      for (const role of contract.roles) {
        // Map.has() ensures deduplication - only first occurrence is stored
        if (!roleMap.has(role.name)) {
          roleMap.set(role.name, role.value);
        }
      }
    }
  }

  // Sort roles by name for deterministic output
  const sortedRoles = Array.from(roleMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  if (sortedRoles.length === 0) {
    return `/**
 * No roles found in contracts.
 */
export const ROLES = {} as const`;
  }

  const roleEntries = sortedRoles.map(([name, value]) => `    ${name}: '${normalizeRoleValue(value)}'`).join(",\n");

  return `/**
 * All role identifiers extracted from contracts.
 */
export const ROLES = {
${roleEntries}
} as const

/**
 * Total number of unique roles in the registry.
 */
export const TOTAL_ROLES = ${sortedRoles.length} as const`;
}

/**
 * Generate summary statistics.
 *
 * @param facets - Array of facet metadata
 * @param infrastructure - Array of infrastructure metadata
 * @returns Summary object with statistics
 */
export function generateSummary(
  facets: ContractMetadata[],
  infrastructure: ContractMetadata[],
): {
  totalFacets: number;
  totalInfrastructure: number;
  byCategory: Record<string, number>;
  byLayer: Record<number, number>;
  withRoles: number;
} {
  const byCategory: Record<string, number> = {};
  const byLayer: Record<number, number> = {};
  let withRoles = 0;

  for (const facet of facets) {
    byCategory[facet.category] = (byCategory[facet.category] || 0) + 1;
    byLayer[facet.layer] = (byLayer[facet.layer] || 0) + 1;
    if (facet.roles.length > 0) withRoles++;
  }

  return {
    totalFacets: facets.length,
    totalInfrastructure: infrastructure.length,
    byCategory,
    byLayer,
    withRoles,
  };
}
