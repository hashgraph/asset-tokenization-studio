// SPDX-License-Identifier: Apache-2.0

/**
 * Solidity parsing utilities for registry generation.
 *
 * @module tools/utils/solidityUtils
 */

/**
 * Extract contract names from Solidity source code.
 *
 * Matches: contract ContractName, abstract contract ContractName, interface IName
 *
 * @param source - Solidity source code
 * @returns Array of contract names
 */
export function extractContractNames(source: string): string[] {
    const contractRegex =
        /(?:abstract\s+)?(?:contract|interface|library)\s+(\w+)/g
    const matches: string[] = []

    let match
    while ((match = contractRegex.exec(source)) !== null) {
        matches.push(match[1])
    }

    return matches
}

/**
 * Extract role definitions from Solidity code.
 *
 * Matches patterns like:
 * - bytes32 public constant ROLE_NAME = keccak256("ROLE_NAME");
 * - bytes32 constant ROLE_NAME = ...
 *
 * @param source - Solidity source code
 * @returns Array of role names
 */
export function extractRoles(source: string): string[] {
    const roleRegex = /bytes32\s+(?:public\s+)?constant\s+(\w+_ROLE)\s*=/g
    const roles: string[] = []

    let match
    while ((match = roleRegex.exec(source)) !== null) {
        roles.push(match[1])
    }

    return roles
}

/**
 * Extract imported contract paths.
 *
 * Matches: import "path/to/Contract.sol"
 *
 * @param source - Solidity source code
 * @returns Array of import paths
 */
export function extractImports(source: string): string[] {
    const importRegex = /import\s+["']([^"']+)["']/g
    const imports: string[] = []

    let match
    while ((match = importRegex.exec(source)) !== null) {
        imports.push(match[1])
    }

    return imports
}

/**
 * Check if contract is a facet based on naming convention.
 *
 * @param contractName - Contract name to check
 * @returns true if name ends with 'Facet'
 */
export function isFacetName(contractName: string): boolean {
    return contractName.endsWith('Facet')
}

/**
 * Check if contract is a TimeTravel variant.
 *
 * @param contractName - Contract name to check
 * @returns true if name ends with 'TimeTravel'
 */
export function isTimeTravelVariant(contractName: string): boolean {
    return contractName.endsWith('TimeTravel')
}

/**
 * Get base contract name from TimeTravel variant.
 *
 * @param contractName - Contract name (potentially TimeTravel)
 * @returns Base contract name without 'TimeTravel' suffix
 */
export function getBaseName(contractName: string): string {
    if (isTimeTravelVariant(contractName)) {
        return contractName.replace(/TimeTravel$/, '')
    }
    return contractName
}

/**
 * Extract pragma Solidity version.
 *
 * @param source - Solidity source code
 * @returns Solidity version or null
 */
export function extractSolidityVersion(source: string): string | null {
    const pragmaRegex = /pragma\s+solidity\s+([^;]+);/
    const match = source.match(pragmaRegex)
    return match ? match[1].trim() : null
}

/**
 * Check if source contains specific interface implementation.
 *
 * @param source - Solidity source code
 * @param interfaceName - Interface name to check
 * @returns true if contract implements interface
 */
export function implementsInterface(
    source: string,
    interfaceName: string
): boolean {
    const implementsRegex = new RegExp(
        `contract\\s+\\w+\\s+is\\s+[^{]*\\b${interfaceName}\\b`
    )
    return implementsRegex.test(source)
}

/**
 * Extract contract inheritance chain.
 *
 * Matches: contract MyContract is BaseA, BaseB, BaseC
 *
 * @param source - Solidity source code
 * @param contractName - Contract name to find inheritance for
 * @returns Array of parent contract names
 */
export function extractInheritance(
    source: string,
    contractName: string
): string[] {
    const regex = new RegExp(`contract\\s+${contractName}\\s+is\\s+([^{]+)`)
    const match = source.match(regex)

    if (!match) {
        return []
    }

    // Split by comma and clean up whitespace
    return match[1]
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
}
