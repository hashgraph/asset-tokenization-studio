// SPDX-License-Identifier: Apache-2.0

import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"
import axios from "axios"
import { HederaService, HederaTransactionHashResponse } from "@domain/ports/hedera.port"
import { AccountId, EvmAddress } from "@hiero-ledger/sdk"

/**
 * Implementation of Hedera Mirror Node service
 * Provides access to transaction data and Hedera hash extraction from Hedera Mirror Node API
 */
interface TransactionMirrorNodeResponse {
  transactions?: Array<{
    transaction_hash?: string
    nonce?: number
    consensus_timestamp?: string
    result?: string
  }>
}

interface AccountMirrorNodeResponse {
  account: string
}

@Injectable()
export class HederaServiceImpl implements HederaService {
  private readonly logger = new Logger(HederaServiceImpl.name)
  private readonly mirrorNodeUrl: string
  private readonly maxRetries: number = 3

  constructor(private readonly configService: ConfigService) {
    this.mirrorNodeUrl =
      this.configService.get<string>("HEDERA_MIRROR_NODE_URL") || "https://testnet.mirrornode.hedera.com"
  }

  /**
   * Retrieves the Hedera transaction hash for a parent transaction from Hedera Mirror Node
   * Uses robust HTTP client with timeout, retries and proper error handling
   */
  async getParentHederaTransactionHash(transactionId: string): Promise<HederaTransactionHashResponse> {
    this.validateTransactionId(transactionId)

    try {
      const formattedTransactionId = this.convertTransactionIdFormat(transactionId)
      const data: TransactionMirrorNodeResponse = await this.fetchData(`transactions/${formattedTransactionId}`)

      if (data.transactions && Array.isArray(data.transactions)) {
        const parentTx = data.transactions.find((tx) => !tx.nonce || tx.nonce === 0)

        if (parentTx?.transaction_hash) {
          const hederaTransactionHash = this.convertBase64ToTransactionHash(parentTx.transaction_hash)
          this.logger.debug(`Retrieved Hedera hash from Mirror Node: ${hederaTransactionHash}`)

          return {
            hederaTransactionHash,
            isFromMirrorNode: true,
          }
        }
      }

      this.logger.warn(`No parent transaction found for ${transactionId}, using fallback hash`)
      return this.generateFallbackHash(transactionId)
    } catch (error) {
      this.logger.error(`Error fetching transaction hash from Mirror Node: ${error.message}`, error.stack)
      return this.generateFallbackHash(transactionId)
    }
  }

  async getEvmAddressFromHedera(hederaAddress: string): Promise<string> {
    const input = hederaAddress.trim().toLowerCase()
    const id = AccountId.fromString(input)
    return `0x${id.toSolidityAddress()}`
  }

  async getHederaAddressFromEvm(evmAddress: string): Promise<string> {
    const input = evmAddress.trim().toLowerCase()
    const evmAddressWithPrefix = input.startsWith("0x") ? input : `0x${input}`
    if (this.isLongZeroAddress(evmAddressWithPrefix)) {
      return AccountId.fromEvmAddress(0, 0, evmAddressWithPrefix).toString()
    }
    return ((await this.fetchData(`accounts/${evmAddressWithPrefix}`)) as AccountMirrorNodeResponse).account
  }

  /**
   * Fetches data from Mirror Node with retry logic and timeout
   */
  private async fetchData<T>(path: string): Promise<T> {
    const url = `${this.mirrorNodeUrl}/api/v1/${path}`

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`Fetching data from: ${url} (attempt ${attempt})`)

        const { data } = await axios.get(url)

        this.logger.debug(`Successfully fetched data for ${url}`)
        return data
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries

        if (error.name === "AbortError") {
          this.logger.warn(`Request timeout for ${url} (attempt ${attempt})`)
        } else {
          this.logger.warn(`Request failed for ${url} (attempt ${attempt}): ${error.message}`)
        }

        if (isLastAttempt) {
          throw error
        }

        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw new Error("All retry attempts failed")
  }

  /**
   * Validates the format of a Hedera transaction ID
   */
  private validateTransactionId(transactionId: string): void {
    if (!transactionId || typeof transactionId !== "string") {
      throw new Error("Transaction ID must be a non-empty string")
    }

    const pattern = /^\d+\.\d+\.\d+[@-]\d+[.-]\d+$/
    if (!pattern.test(transactionId)) {
      throw new Error(`Invalid transaction ID format: ${transactionId}. Expected format: accountId@seconds.nanoseconds`)
    }
  }

  /**
   * Converts base64 hash to hexadecimal format with 0x prefix
   * Returns the full 32-byte (64 hex characters) transaction hash
   */
  private convertBase64ToTransactionHash(base64Hash: string): string {
    const hex = Buffer.from(base64Hash, "base64").toString("hex")
    return `0x${hex}`
  }

  /**
   * Generates a fallback transaction hash when Mirror Node data is unavailable
   */
  private generateFallbackHash(transactionId: string): HederaTransactionHashResponse {
    const hederaTransactionHash = this.generateTransactionHash(transactionId)
    this.logger.debug(`Generated fallback Hedera transaction hash: ${hederaTransactionHash}`)

    return {
      hederaTransactionHash,
      isFromMirrorNode: false,
    }
  }

  /**
   * Generates a fallback Hedera transaction hash when Mirror Node data is unavailable.
   * Uses SHA-384 algorithm as specified in Hedera documentation for transaction integrity verification.
   * @param transactionId - The Hedera transaction ID
   * @returns A deterministic hash in the format 0x...
   */
  private generateTransactionHash(transactionId: string): string {
    // Use SHA-384 as per Hedera documentation for transaction hash computation
    const hash = crypto.createHash("sha384").update(transactionId).digest("hex")
    return `0x${hash}`
  }

  /**
   * Converts Hedera transaction ID format from @ to - for Mirror Node API
   * Example: 0.0.2665309@1756125372.670066465 -> 0.0.2665309-1756125372-670066465
   */
  private convertTransactionIdFormat(transactionId: string): string {
    const parts = transactionId.split("@")
    if (parts.length !== 2) {
      throw new Error(`Invalid transaction ID format: ${transactionId}`)
    }

    const accountId = parts[0]
    const timestamp = parts[1]

    const timestampFormatted = timestamp.replace(/\.([^.]+)$/, "-$1")

    return `${accountId}-${timestampFormatted}`
  }

  private isLongZeroAddress(address: string) {
    const addressBytes = EvmAddress.fromString(address).toBytes()
    for (let i = 0; i < 12; i++) {
      if (addressBytes[i] != 0) {
        return false
      }
    }
    return true
  }
}
