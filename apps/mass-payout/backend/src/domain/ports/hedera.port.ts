// SPDX-License-Identifier: Apache-2.0

/**
 * Response interface for Hedera transaction hash retrieval
 */
export interface HederaTransactionHashResponse {
  /** The EVM transaction hash in hexadecimal format with 0x prefix */
  hederaTransactionHash: string
  /** Whether the hash was retrieved from Mirror Node API or generated as fallback */
  isFromMirrorNode: boolean
}

/**
 * Port interface for Hedera Mirror Node operations
 * Provides access to transaction data and EVM hash extraction
 */
export interface HederaService {
  /**
   * Retrieves the Hedera transaction hash for a parent transaction from Hedera Mirror Node
   * Converts the base64 hash from Mirror Node API to hexadecimal format
   *
   * @param transactionId The Hedera transaction ID (format: accountId@seconds.nanoseconds)
   * @returns Promise with Hedera transaction hash response
   * @throws Error if transaction ID format is invalid
   */
  getParentHederaTransactionHash(transactionId: string): Promise<HederaTransactionHashResponse>

  getEvmAddressFromHedera(hederaAddress: string): Promise<string>

  getHederaAddressFromEvm(evmAddress: string): Promise<string>
}
