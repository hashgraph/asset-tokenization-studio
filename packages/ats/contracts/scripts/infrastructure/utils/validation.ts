// SPDX-License-Identifier: Apache-2.0

/**
 * Validation utilities for ATS deployment system.
 *
 * Provides reusable validation functions for addresses, contract IDs,
 * and other common input validation needs.
 *
 * @module core/utils/validation
 */

import { ethers } from 'ethers'

/**
 * Check if a string is a valid Ethereum address.
 *
 * @param address - Address string to validate
 * @returns true if valid address, false otherwise
 *
 * @example
 * ```typescript
 * isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb') // true
 * isValidAddress('0xinvalid') // false
 * isValidAddress('') // false
 * ```
 */
export function isValidAddress(address: string): boolean {
    try {
        return ethers.utils.isAddress(address)
    } catch {
        return false
    }
}

/**
 * Check if a string is a valid bytes32 value.
 *
 * @param value - Bytes32 string to validate (should be 66 chars: '0x' + 64 hex chars)
 * @returns true if valid bytes32, false otherwise
 *
 * @example
 * ```typescript
 * isValidBytes32('0x' + '0'.repeat(64)) // true
 * isValidBytes32('0x123') // false
 * ```
 */
export function isValidBytes32(value: string): boolean {
    if (typeof value !== 'string') {
        return false
    }

    // Must start with 0x and be 66 characters long (0x + 64 hex chars)
    if (!value.startsWith('0x') || value.length !== 66) {
        return false
    }

    // Must be valid hex
    try {
        ethers.utils.hexlify(value)
        return true
    } catch {
        return false
    }
}

/**
 * Check if a string is a valid Hedera contract ID.
 * Format: shard.realm.num (e.g., '0.0.12345')
 *
 * @param id - Contract ID to validate
 * @returns true if valid Hedera contract ID, false otherwise
 *
 * @example
 * ```typescript
 * isValidContractId('0.0.12345') // true
 * isValidContractId('0.0.abc') // false
 * isValidContractId('12345') // false
 * ```
 */
export function isValidContractId(id: string): boolean {
    if (typeof id !== 'string') {
        return false
    }

    const parts = id.split('.')
    if (parts.length !== 3) {
        return false
    }

    // Each part must be a non-negative integer
    return parts.every((part) => {
        const num = parseInt(part, 10)
        return !isNaN(num) && num >= 0 && num.toString() === part
    })
}

/**
 * Validate a facet name against the registry.
 *
 * @param name - Facet name to validate
 * @throws Error if facet name is invalid
 *
 * @example
 * ```typescript
 * validateFacetName('AccessControlFacet') // OK
 * validateFacetName('InvalidFacet') // Throws error
 * ```
 */
export function validateFacetName(name: string): void {
    if (!name || typeof name !== 'string') {
        throw new Error('Facet name must be a non-empty string')
    }

    if (name.trim() !== name) {
        throw new Error('Facet name cannot have leading/trailing whitespace')
    }
}

/**
 * Validate a network name.
 *
 * @param network - Network name to validate
 * @throws Error if network name is invalid
 *
 * @example
 * ```typescript
 * validateNetwork('testnet') // OK
 * validateNetwork('') // Throws error
 * ```
 */
export function validateNetwork(network: string): void {
    if (!network || typeof network !== 'string') {
        throw new Error('Network must be a non-empty string')
    }

    if (network.trim() !== network) {
        throw new Error('Network cannot have leading/trailing whitespace')
    }
}

/**
 * Validate an Ethereum address.
 *
 * @param address - Address to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if address is invalid
 *
 * @example
 * ```typescript
 * validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'proxy')
 * validateAddress('0xinvalid', 'proxy') // Throws error
 * ```
 */
export function validateAddress(
    address: string,
    fieldName: string = 'address'
): void {
    if (!address) {
        throw new Error(`${fieldName} is required`)
    }

    if (!isValidAddress(address)) {
        throw new Error(`Invalid ${fieldName}: ${address}`)
    }
}

/**
 * Validate a bytes32 value.
 *
 * @param value - Bytes32 value to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if bytes32 value is invalid
 */
export function validateBytes32(
    value: string,
    fieldName: string = 'bytes32 value'
): void {
    if (!value) {
        throw new Error(`${fieldName} is required`)
    }

    if (!isValidBytes32(value)) {
        throw new Error(
            `Invalid ${fieldName}: must be 66 characters (0x + 64 hex chars)`
        )
    }
}

/**
 * Validate a Hedera contract ID.
 *
 * @param id - Contract ID to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if contract ID is invalid
 */
export function validateContractId(
    id: string,
    fieldName: string = 'contract ID'
): void {
    if (!id) {
        throw new Error(`${fieldName} is required`)
    }

    if (!isValidContractId(id)) {
        throw new Error(
            `Invalid ${fieldName}: must be in format 'shard.realm.num' (e.g., '0.0.12345')`
        )
    }
}

/**
 * Validate that a value is a positive number.
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if value is not a positive number
 */
export function validatePositiveNumber(
    value: number,
    fieldName: string = 'value'
): void {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${fieldName} must be a number`)
    }

    if (value <= 0) {
        throw new Error(`${fieldName} must be positive`)
    }
}

/**
 * Validate that a value is a non-negative integer.
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if value is not a non-negative integer
 */
export function validateNonNegativeInteger(
    value: number,
    fieldName: string = 'value'
): void {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${fieldName} must be a number`)
    }

    if (value < 0) {
        throw new Error(`${fieldName} cannot be negative`)
    }

    if (!Number.isInteger(value)) {
        throw new Error(`${fieldName} must be an integer`)
    }
}
