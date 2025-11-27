// SPDX-License-Identifier: Apache-2.0

/**
 * Hedera-specific utilities.
 *
 * Utilities for interacting with Hedera network features like mirror nodes
 * and contract ID resolution.
 *
 * @module infrastructure/utils/hedera
 */

import { warn } from "./logging";

/**
 * Fetch Hedera Contract ID from mirror node.
 *
 * Queries the Hedera mirror node REST API to resolve an EVM address
 * to its corresponding Hedera Contract ID (0.0.xxxxx format).
 *
 * @param network - Network name (testnet, mainnet, previewnet, etc.)
 * @param evmAddress - EVM address (0x...)
 * @returns Hedera Contract ID (0.0.xxxxx) or undefined if not found
 *
 * @example
 * ```typescript
 * const contractId = await fetchHederaContractId('testnet', '0x1234...')
 * if (contractId) {
 *   console.log(`Hedera Contract ID: ${contractId}`) // 0.0.12345
 * }
 * ```
 */
export async function fetchHederaContractId(network: string, evmAddress: string): Promise<string | undefined> {
  try {
    const mirrorNodeUrl = getMirrorNodeUrl(network);
    const response = await fetch(`${mirrorNodeUrl}/api/v1/contracts/${evmAddress}`);

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    return data.contract_id;
  } catch {
    return undefined;
  }
}

/**
 * Get mirror node URL for network.
 *
 * Attempts to read mirror node URL from network configuration,
 * falling back to hardcoded defaults for known Hedera networks.
 *
 * @param network - Network name
 * @returns Mirror node base URL
 *
 * @example
 * ```typescript
 * const url = getMirrorNodeUrl('testnet')
 * // Returns: 'https://testnet.mirrornode.hedera.com'
 * ```
 */
export function getMirrorNodeUrl(network: string): string {
  try {
    // Import here to avoid circular dependency during config loading
    const { getNetworkConfig } = require("../config");
    const config = getNetworkConfig(network);

    if (config.mirrorNodeUrl) {
      return config.mirrorNodeUrl;
    }
  } catch (error) {
    // Fall through to defaults if config not available
    const msg = error instanceof Error ? error.message : String(error);
    warn(`Could not read mirror node URL from config: ${msg}`);
  }

  // Fallback to hardcoded defaults for known Hedera networks
  const lowerNetwork = network.toLowerCase();
  if (lowerNetwork.includes("mainnet")) {
    return "https://mainnet-public.mirrornode.hedera.com";
  }
  if (lowerNetwork.includes("testnet")) {
    return "https://testnet.mirrornode.hedera.com";
  }
  if (lowerNetwork.includes("previewnet")) {
    return "https://previewnet.mirrornode.hedera.com";
  }

  // Default to testnet if network not recognized
  return "https://testnet.mirrornode.hedera.com";
}

/**
 * Check if network is a Hedera network.
 *
 * @param network - Network name
 * @returns true if network name indicates Hedera
 *
 * @example
 * ```typescript
 * isHederaNetwork('testnet')           // true
 * isHederaNetwork('hedera-testnet')    // true
 * isHederaNetwork('mainnet')           // true
 * isHederaNetwork('ethereum-mainnet')  // false
 * ```
 */
export function isHederaNetwork(network: string): boolean {
  const lowerNetwork = network.toLowerCase();
  return (
    lowerNetwork.includes("hedera") ||
    lowerNetwork.includes("mainnet") ||
    lowerNetwork.includes("testnet") ||
    lowerNetwork.includes("previewnet")
  );
}
