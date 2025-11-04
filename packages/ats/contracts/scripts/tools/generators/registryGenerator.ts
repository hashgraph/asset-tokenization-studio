// SPDX-License-Identifier: Apache-2.0

/**
 * Generate TypeScript registry code from contract metadata.
 *
 * @module tools/generators/registryGenerator
 */

import { ContractMetadata } from '../scanner/metadataExtractor'
import {
    MethodDefinition,
    EventDefinition,
    ErrorDefinition,
} from '../../infrastructure/types'

/**
 * Format methods array for registry output.
 *
 * Produces readable, formatted TypeScript code with proper indentation.
 *
 * @param methods - Array of method definitions
 * @param indent - Indentation level (number of spaces)
 * @returns Formatted methods array string
 */
function formatMethods(
    methods: MethodDefinition[],
    indent: number = 8
): string {
    if (methods.length === 0) {
        return '[]'
    }

    const indentStr = ' '.repeat(indent)
    const itemIndent = ' '.repeat(indent + 4)
    const propIndent = ' '.repeat(indent + 8)

    const formattedMethods = methods
        .map(
            (m) =>
                `${itemIndent}{\n${propIndent}name: '${m.name}',\n${propIndent}signature: '${m.signature}',\n${propIndent}selector: '${m.selector}'\n${itemIndent}}`
        )
        .join(',\n')

    return `[\n${formattedMethods}\n${indentStr}]`
}

/**
 * Format events array for registry output.
 *
 * Produces readable, formatted TypeScript code with proper indentation.
 *
 * @param events - Array of event definitions
 * @param indent - Indentation level (number of spaces)
 * @returns Formatted events array string
 */
function formatEvents(events: EventDefinition[], indent: number = 8): string {
    if (events.length === 0) {
        return '[]'
    }

    const indentStr = ' '.repeat(indent)
    const itemIndent = ' '.repeat(indent + 4)
    const propIndent = ' '.repeat(indent + 8)

    const formattedEvents = events
        .map(
            (e) =>
                `${itemIndent}{\n${propIndent}name: '${e.name}',\n${propIndent}signature: '${e.signature}',\n${propIndent}topic0: '${e.topic0}'\n${itemIndent}}`
        )
        .join(',\n')

    return `[\n${formattedEvents}\n${indentStr}]`
}

/**
 * Format errors array for registry output.
 *
 * Produces readable, formatted TypeScript code with proper indentation.
 *
 * @param errors - Array of error definitions
 * @param indent - Indentation level (number of spaces)
 * @returns Formatted errors array string
 */
function formatErrors(errors: ErrorDefinition[], indent: number = 8): string {
    if (errors.length === 0) {
        return '[]'
    }

    const indentStr = ' '.repeat(indent)
    const itemIndent = ' '.repeat(indent + 4)
    const propIndent = ' '.repeat(indent + 8)

    const formattedErrors = errors
        .map(
            (e) =>
                `${itemIndent}{\n${propIndent}name: '${e.name}',\n${propIndent}signature: '${e.signature}',\n${propIndent}selector: '${e.selector}'\n${itemIndent}}`
        )
        .join(',\n')

    return `[\n${formattedErrors}\n${indentStr}]`
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
 *
 * @example
 * normalizeRoleValue('0x00') // '0x0000000000000000000000000000000000000000000000000000000000000000'
 * normalizeRoleValue('0x1234') // '0x0000000000000000000000000000000000000000000000000000000000001234'
 */
function normalizeRoleValue(value: string): string {
    // Remove '0x' prefix if present
    const hexValue = value.startsWith('0x') ? value.slice(2) : value
    // Pad to 64 characters (32 bytes)
    const paddedValue = hexValue.padStart(64, '0')
    // Return with '0x' prefix
    return `0x${paddedValue}`
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
 * @returns TypeScript source code
 */
export function generateRegistry(
    facets: ContractMetadata[],
    infrastructure: ContractMetadata[],
    allRoles?: Map<string, string>,
    storageWrappers?: ContractMetadata[],
    mocks?: ContractMetadata[],
    moduleName: string = '@scripts/infrastructure'
): string {
    const header = generateHeader(
        facets.length,
        infrastructure.length,
        mocks?.length ?? 0,
        moduleName,
        facets
    )
    const facetRegistry = generateFacetRegistry(facets)
    const contractRegistry = generateContractRegistry(infrastructure)
    const storageWrapperRegistry = storageWrappers
        ? generateStorageWrapperRegistry(storageWrappers)
        : ''
    const mockRegistry =
        mocks && mocks.length > 0 ? generateMockRegistry(mocks) : ''
    const constants = generateConstants(facets, infrastructure, allRoles)

    const registries = [header, facetRegistry, contractRegistry]
    if (storageWrapperRegistry) {
        registries.push(storageWrapperRegistry)
    }
    if (mockRegistry) {
        registries.push(mockRegistry)
    }
    registries.push(constants)

    return registries.join('\n\n') + '\n'
}

/**
 * Generate file header with imports and comments.
 *
 * @param facetCount - Number of facets
 * @param infrastructureCount - Number of infrastructure contracts
 * @param mockCount - Number of mock contracts
 * @param moduleName - Module name for imports
 * @returns Header code
 */
function generateHeader(
    facetCount: number,
    infrastructureCount: number,
    mockCount: number,
    moduleName: string = '@scripts/infrastructure',
    facets: ContractMetadata[] = []
): string {
    const mockLine = mockCount > 0 ? `\n * Mocks: ${mockCount}` : ''

    // Sort facet names alphabetically for deterministic output
    const sortedFacetNames = [...facets].map((f) => f.name).sort()

    // Generate TypeChain factory imports
    // Include both regular and TimeTravel variants where applicable
    const factoryImports: string[] = []
    for (const name of sortedFacetNames) {
        factoryImports.push(`    ${name}__factory`)

        // Check if this facet should have a TimeTravel variant
        // (ends with 'Facet' and is not 'TimeTravelFacet')
        if (name !== 'TimeTravelFacet' && name.endsWith('Facet')) {
            factoryImports.push(`    ${name}TimeTravel__factory`)
        }
    }

    const factoryImportsStr = factoryImports.join(',\n')

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
 * @module domain/atsRegistry.data
 */

import {
    FacetDefinition,
    ContractDefinition,
    StorageWrapperDefinition,
} from '${moduleName}'
import {
${factoryImportsStr}
} from '@contract-types'`
}

/**
 * Generate FACET_REGISTRY constant.
 *
 * @param facets - Array of facet metadata
 * @returns TypeScript code for FACET_REGISTRY
 */
function generateFacetRegistry(facets: ContractMetadata[]): string {
    // Sort facets alphabetically for deterministic output
    const sortedFacets = [...facets].sort((a, b) =>
        a.name.localeCompare(b.name)
    )

    const entries = sortedFacets.map((facet) => generateFacetEntry(facet))

    return `/**
 * Registry of all facet contracts.
 */
export const FACET_REGISTRY: Record<string, FacetDefinition> = {
${entries.join(',\n\n')}
}

/**
 * Total number of facets in the registry.
 */
export const TOTAL_FACETS = ${facets.length} as const`
}

/**
 * Generate single facet registry entry.
 *
 * ENHANCED (2025-01-21): Includes resolver key object and role count.
 * Provides metadata useful for deployment verification and documentation.
 *
 * @param facet - Facet metadata
 * @returns TypeScript object literal
 */
function generateFacetEntry(facet: ContractMetadata): string {
    const resolverKeyLine = facet.resolverKey
        ? `\n        resolverKey: {\n            name: '${facet.resolverKey.name}',\n            value: '${facet.resolverKey.value}'\n        },`
        : ''

    const rolesLine =
        facet.roles.length > 0
            ? `\n        roleCount: ${facet.roles.length},`
            : ''

    const inheritanceLine =
        facet.inheritance.length > 0
            ? `\n        inheritance: ${JSON.stringify(facet.inheritance)},`
            : ''

    const methodsLine =
        facet.methods.length > 0
            ? `\n        methods: ${formatMethods(facet.methods, 8)},`
            : ''

    const eventsLine =
        facet.events.length > 0
            ? `\n        events: ${formatEvents(facet.events, 8)},`
            : ''

    const errorsLine =
        facet.errors.length > 0
            ? `\n        errors: ${formatErrors(facet.errors, 8)},`
            : ''

    const descriptionLine = facet.description
        ? `\n        description: '${facet.description}',`
        : ''

    // Add TypeChain factory reference with TimeTravel support
    // Check if facet should have TimeTravel variant (ends with 'Facet' and is not 'TimeTravelFacet')
    const hasTimeTravel =
        facet.name !== 'TimeTravelFacet' && facet.name.endsWith('Facet')

    const factoryLine = hasTimeTravel
        ? `\n        factory: (signer, useTimeTravel = false) => useTimeTravel 
            ? new ${facet.name}TimeTravel__factory(signer)
            : new ${facet.name}__factory(signer),`
        : `\n        factory: (signer) => new ${facet.name}__factory(signer),`

    return `    ${facet.name}: {
        name: '${facet.name}',${descriptionLine}${resolverKeyLine}${rolesLine}${inheritanceLine}${methodsLine}${eventsLine}${errorsLine}${factoryLine}
    }`
}

/**
 * Generate INFRASTRUCTURE_CONTRACTS constant.
 *
 * @param infrastructure - Array of infrastructure contract metadata
 * @returns TypeScript code for INFRASTRUCTURE_CONTRACTS
 */
function generateContractRegistry(infrastructure: ContractMetadata[]): string {
    const sortedContracts = [...infrastructure].sort((a, b) =>
        a.name.localeCompare(b.name)
    )

    const entries = sortedContracts.map((contract) =>
        generateContractEntry(contract)
    )

    return `/**
 * Registry of non-facet infrastructure contracts (BusinessLogicResolver, Factory, etc.).
 * These are core system contracts that are not Diamond facets.
 */
export const INFRASTRUCTURE_CONTRACTS: Record<string, ContractDefinition> = {
${entries.join(',\n\n')}
}

/**
 * Total number of infrastructure contracts in the registry.
 */
export const TOTAL_INFRASTRUCTURE_CONTRACTS = ${infrastructure.length} as const`
}

/**
 * Generate single contract registry entry.
 *
 * ENHANCED (2025-10-21): Includes methods list.
 *
 * @param contract - Contract metadata
 * @returns TypeScript object literal
 */
function generateContractEntry(contract: ContractMetadata): string {
    const inheritanceLine =
        contract.inheritance.length > 0
            ? `\n        inheritance: ${JSON.stringify(contract.inheritance)},`
            : ''

    const methodsLine =
        contract.methods.length > 0
            ? `\n        methods: ${formatMethods(contract.methods, 8)},`
            : ''

    const eventsLine =
        contract.events.length > 0
            ? `\n        events: ${formatEvents(contract.events, 8)},`
            : ''

    const errorsLine =
        contract.errors.length > 0
            ? `\n        errors: ${formatErrors(contract.errors, 8)},`
            : ''

    const descriptionLine = contract.description
        ? `\n        description: '${contract.description}',`
        : ''

    return `    ${contract.name}: {
        name: '${contract.name}',${descriptionLine}${inheritanceLine}${methodsLine}${eventsLine}${errorsLine}
    }`
}

/**
 * Generate STORAGE_WRAPPER_REGISTRY constant.
 *
 * @param storageWrappers - Array of storage wrapper metadata
 * @returns TypeScript code for STORAGE_WRAPPER_REGISTRY
 */
function generateStorageWrapperRegistry(
    storageWrappers: ContractMetadata[]
): string {
    const sortedWrappers = [...storageWrappers].sort((a, b) =>
        a.name.localeCompare(b.name)
    )

    const entries = sortedWrappers.map((wrapper) =>
        generateStorageWrapperEntry(wrapper)
    )

    return `/**
 * Registry of storage wrapper contracts.
 *
 * StorageWrappers provide internal storage and helper methods for facets.
 * They are abstract contracts inherited by facets, not deployed directly.
 */
export const STORAGE_WRAPPER_REGISTRY: Record<string, StorageWrapperDefinition> = {
${entries.join(',\n\n')}
}

/**
 * Total number of storage wrapper contracts in the registry.
 */
export const TOTAL_STORAGE_WRAPPERS = ${storageWrappers.length} as const`
}

/**
 * Generate single storage wrapper registry entry.
 *
 * @param wrapper - Storage wrapper metadata
 * @returns TypeScript object literal
 */
function generateStorageWrapperEntry(wrapper: ContractMetadata): string {
    const inheritanceLine =
        wrapper.inheritance.length > 0
            ? `\n        inheritance: ${JSON.stringify(wrapper.inheritance)},`
            : ''

    const eventsLine =
        wrapper.events.length > 0
            ? `,\n        events: ${formatEvents(wrapper.events, 8)}`
            : ''

    const errorsLine =
        wrapper.errors.length > 0
            ? `,\n        errors: ${formatErrors(wrapper.errors, 8)}`
            : ''

    const descriptionLine = wrapper.description
        ? `\n        description: '${wrapper.description}',`
        : ''

    return `    ${wrapper.name}: {
        name: '${wrapper.name}',${descriptionLine}${inheritanceLine}
        methods: ${formatMethods(wrapper.methods, 8)}${eventsLine}${errorsLine}
    }`
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
    const sortedMocks = [...mocks].sort((a, b) => a.name.localeCompare(b.name))

    const entries = sortedMocks.map((mock) => generateMockEntry(mock))

    return `/**
 * Registry of mock/test contracts.
 *
 * These contracts are test utilities for downstream projects.
 * Uses FacetDefinition to support resolver keys for mock facets.
 * Not intended for production deployment.
 */
export const MOCK_CONTRACTS: Record<string, FacetDefinition> = {
${entries.join(',\n\n')}
}

/**
 * Total number of mock contracts in the registry.
 */
export const TOTAL_MOCKS = ${mocks.length} as const`
}

/**
 * Generate single mock contract registry entry.
 *
 * Uses FacetDefinition format to support resolver keys for mock facets.
 *
 * @param mock - Mock contract metadata
 * @returns TypeScript object literal
 */
function generateMockEntry(mock: ContractMetadata): string {
    const resolverKeyLine = mock.resolverKey
        ? `\n        resolverKey: {\n            name: '${mock.resolverKey.name}',\n            value: '${mock.resolverKey.value}'\n        },`
        : ''

    const inheritanceLine =
        mock.inheritance.length > 0
            ? `\n        inheritance: ${JSON.stringify(mock.inheritance)},`
            : ''

    const eventsLine =
        mock.events.length > 0
            ? `,\n        events: ${formatEvents(mock.events, 8)}`
            : ''

    const errorsLine =
        mock.errors.length > 0
            ? `,\n        errors: ${formatErrors(mock.errors, 8)}`
            : ''

    const descriptionLine = mock.description
        ? `\n        description: '${mock.description}',`
        : ''

    return `    ${mock.name}: {
        name: '${mock.name}',${descriptionLine}${resolverKeyLine}${inheritanceLine}
        methods: ${formatMethods(mock.methods, 8)}${eventsLine}${errorsLine}
    }`
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
    allRoles?: Map<string, string>
): string {
    // Use provided roles map or collect from contracts
    // Map automatically deduplicates by role name (key)
    const roleMap = allRoles || new Map<string, string>()

    // If no roles provided, collect from contracts
    if (!allRoles) {
        const allContracts = [...facets, ...infrastructure]
        for (const contract of allContracts) {
            for (const role of contract.roles) {
                // Map.has() ensures deduplication - only first occurrence is stored
                if (!roleMap.has(role.name)) {
                    roleMap.set(role.name, role.value)
                }
            }
        }
    }

    // Sort roles by name for deterministic output
    const sortedRoles = Array.from(roleMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
    )

    if (sortedRoles.length === 0) {
        return `/**
 * No roles found in contracts.
 */
export const ROLES = {} as const`
    }

    const roleEntries = sortedRoles
        .map(([name, value]) => `    ${name}: '${normalizeRoleValue(value)}'`)
        .join(',\n')

    return `/**
 * All role identifiers extracted from contracts.
 */
export const ROLES = {
${roleEntries}
} as const

/**
 * Total number of unique roles in the registry.
 */
export const TOTAL_ROLES = ${sortedRoles.length} as const`
}

/**
 * Generate summary statistics.
 *
 * @param facets - Array of facet metadata
 * @param infrastructure - Array of infrastructure metadata
 * @returns Summary object
 */
export function generateSummary(
    facets: ContractMetadata[],
    infrastructure: ContractMetadata[]
): {
    totalFacets: number
    totalInfrastructure: number
    byCategory: Record<string, number>
    byLayer: Record<number, number>
    withTimeTravel: number
    withRoles: number
} {
    const byCategory: Record<string, number> = {}
    const byLayer: Record<number, number> = {}
    let withTimeTravel = 0
    let withRoles = 0

    for (const facet of facets) {
        byCategory[facet.category] = (byCategory[facet.category] || 0) + 1
        byLayer[facet.layer] = (byLayer[facet.layer] || 0) + 1
        if (facet.hasTimeTravel) withTimeTravel++
        if (facet.roles.length > 0) withRoles++
    }

    return {
        totalFacets: facets.length,
        totalInfrastructure: infrastructure.length,
        byCategory,
        byLayer,
        withTimeTravel,
        withRoles,
    }
}
