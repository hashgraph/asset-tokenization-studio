// SPDX-License-Identifier: Apache-2.0

/**
 * Metadata extraction from contract files.
 *
 * @module tools/scanner/metadataExtractor
 */

import * as path from 'path'
import { ContractFile } from './contractFinder'
import {
    extractRoles,
    extractImports,
    extractInheritance,
    extractSolidityVersion,
} from '../utils/solidityUtils'

/**
 * Extracted contract metadata.
 */
export interface ContractMetadata {
    /** Contract name */
    name: string

    /** Solidity contract name (usually same as name) */
    contractName: string

    /** Source file path relative to contracts/ */
    sourceFile: string

    /** Detected layer (0-3) */
    layer: number

    /** Detected category */
    category: string

    /** Whether TimeTravel variant exists */
    hasTimeTravel: boolean

    /** Extracted role definitions */
    roles: string[]

    /** Import paths */
    imports: string[]

    /** Parent contracts (inheritance) */
    inheritance: string[]

    /** Solidity version */
    solidityVersion: string | null

    /** Whether this is upgradeable (uses proxy pattern) */
    upgradeable: boolean

    /** Auto-generated description */
    description: string
}

/**
 * Extract metadata from a contract file.
 *
 * @param contract - Contract file information
 * @param hasTimeTravel - Whether TimeTravel variant exists
 * @returns Extracted metadata
 */
export function extractMetadata(
    contract: ContractFile,
    hasTimeTravel: boolean
): ContractMetadata {
    const name = contract.primaryContract
    const layer = detectLayer(contract)
    const category = detectCategory(contract, layer)
    const roles = extractRoles(contract.source)
    const imports = extractImports(contract.source)
    const inheritance = extractInheritance(contract.source, name)
    const solidityVersion = extractSolidityVersion(contract.source)
    const upgradeable = detectUpgradeable(contract)
    const description = generateDescription(name, category, layer)

    return {
        name,
        contractName: name,
        sourceFile: contract.relativePath,
        layer,
        category,
        hasTimeTravel,
        roles,
        imports,
        inheritance,
        solidityVersion,
        upgradeable,
        description,
    }
}

/**
 * Detect layer from file path.
 *
 * Checks for:
 * - contracts/facets/layer_N/ → layer N
 * - Defaults based on category
 *
 * @param contract - Contract file
 * @returns Detected layer (0-3)
 */
function detectLayer(contract: ContractFile): number {
    const pathParts = contract.relativePath.split(path.sep)

    // Look for layer_N in path
    for (const part of pathParts) {
        const layerMatch = part.match(/layer[_-]?(\d)/i)
        if (layerMatch) {
            return parseInt(layerMatch[1], 10)
        }
    }

    // Default layer based on contract type
    const name = contract.primaryContract

    // Infrastructure is layer 0
    if (
        name === 'BusinessLogicResolver' ||
        name === 'Factory' ||
        name === 'ProxyAdmin'
    ) {
        return 0
    }

    // Core facets are typically layer 1
    if (
        name.includes('ERC20') ||
        name.includes('AccessControl') ||
        name.includes('Pause')
    ) {
        return 1
    }

    // Business logic layer 2
    if (name.includes('CorporateAction') || name.includes('Scheduled')) {
        return 2
    }

    // Jurisdiction-specific layer 3
    if (name.includes('USA') || name.includes('EU')) {
        return 3
    }

    // Default to layer 1 for facets
    return 1
}

/**
 * Detect category from contract name and path.
 *
 * @param contract - Contract file
 * @param layer - Detected layer
 * @returns Category string
 */
function detectCategory(contract: ContractFile, layer: number): string {
    const name = contract.primaryContract
    const pathLower = contract.relativePath.toLowerCase()

    // Check path for hints
    if (pathLower.includes('/compliance/')) return 'compliance'
    if (pathLower.includes('/clearing/')) return 'clearing'
    if (pathLower.includes('/asset/')) return 'asset'

    // Check name patterns
    if (
        name.includes('Kyc') ||
        name.includes('ControlList') ||
        name.includes('ERC3643') ||
        name.includes('Compliance')
    ) {
        return 'compliance'
    }

    if (
        name.includes('Clearing') ||
        name.includes('Hold') ||
        name.includes('Redeem')
    ) {
        return 'clearing'
    }

    if (name.includes('Equity') || name.includes('Bond')) {
        return 'asset'
    }

    if (
        name.includes('ERC20') ||
        name.includes('ERC1410') ||
        name.includes('ERC1594') ||
        name.includes('ERC1643') ||
        name.includes('ERC1644') ||
        name.includes('AccessControl') ||
        name.includes('Pause') ||
        name.includes('Diamond') ||
        name.includes('Cap') ||
        name.includes('Freeze')
    ) {
        return 'core'
    }

    // Layer 3 is often jurisdiction-specific
    if (layer === 3) {
        return 'asset'
    }

    // Default
    return 'core'
}

/**
 * Detect if contract is upgradeable (uses proxy pattern).
 *
 * @param contract - Contract file
 * @returns true if upgradeable
 */
function detectUpgradeable(contract: ContractFile): boolean {
    const source = contract.source

    // Check for upgradeable patterns
    if (source.includes('Initializable')) return true
    if (source.includes('UUPSUpgradeable')) return true
    if (source.includes('TransparentUpgradeableProxy')) return true
    if (source.includes('@openzeppelin/contracts-upgradeable')) return true

    // BusinessLogicResolver and Factory are upgradeable
    const name = contract.primaryContract
    if (name === 'BusinessLogicResolver' || name === 'Factory') {
        return true
    }

    return false
}

/**
 * Generate automatic description.
 *
 * @param name - Contract name
 * @param category - Category
 * @param layer - Layer
 * @returns Auto-generated description
 */
function generateDescription(
    name: string,
    category: string,
    layer: number
): string {
    const layerDescriptions: Record<number, string> = {
        0: 'Infrastructure',
        1: 'Core functionality',
        2: 'Business logic',
        3: 'Jurisdiction-specific',
    }

    const categoryDescriptions: Record<string, string> = {
        core: 'core token functionality',
        compliance: 'compliance and regulatory features',
        clearing: 'clearing and settlement operations',
        asset: 'asset-specific features',
        test: 'testing utilities',
    }

    const layerDesc = layerDescriptions[layer] || 'Layer ' + layer
    const categoryDesc = categoryDescriptions[category] || category

    return `${layerDesc} - ${categoryDesc}`
}

/**
 * Extract dependencies from imports.
 *
 * @param imports - Import paths
 * @param allFacetNames - Names of all known facets
 * @returns Array of dependency facet names
 */
export function inferDependencies(
    imports: string[],
    allFacetNames: string[]
): string[] {
    const dependencies: string[] = []

    for (const importPath of imports) {
        // Extract filename from import path
        const fileName = path.basename(importPath, '.sol')

        // Check if it's a known facet
        if (allFacetNames.includes(fileName)) {
            dependencies.push(fileName)
        }
    }

    return dependencies
}
