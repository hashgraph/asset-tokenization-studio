// SPDX-License-Identifier: Apache-2.0

/**
 * Transaction utilities for ATS deployment system.
 *
 * Provides reusable functions for transaction handling, gas estimation,
 * and error recovery during contract deployments.
 *
 * @module core/utils/transaction
 */

import { ContractTransaction, ContractReceipt, providers, BigNumber } from "ethers";
import { DEFAULT_TRANSACTION_TIMEOUT } from "../constants";
import { info, warn, debug } from "./logging";

/**
 * Default number of block confirmations to wait for transaction finality.
 * Increased to 2 for better reliability on networks like Hedera testnet.
 */
export const DEFAULT_TRANSACTION_CONFIRMATIONS = 2;

/**
 * Wait for transaction confirmation with retry logic.
 *
 * @param tx - Transaction to wait for
 * @param confirmations - Number of confirmations to wait for (default: 2)
 * @param timeout - Timeout in milliseconds (default: 120000 = 2 minutes)
 * @returns Promise resolving to ContractReceipt
 * @throws Error if transaction fails or times out
 *
 * @example
 * ```typescript
 * const tx = await contract.deploy()
 * const receipt = await waitForTransaction(tx, 2)
 * console.log(`Gas used: ${receipt.gasUsed}`)
 * ```
 */
export async function waitForTransaction(
  tx: ContractTransaction,
  confirmations: number = DEFAULT_TRANSACTION_CONFIRMATIONS,
  timeout: number = DEFAULT_TRANSACTION_TIMEOUT,
): Promise<ContractReceipt> {
  try {
    const receipt = await Promise.race([
      tx.wait(confirmations),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Transaction timeout")), timeout)),
    ]);

    if (!receipt || receipt.status === 0) {
      throw new Error("Transaction failed");
    }

    return receipt;
  } catch (error) {
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get current gas price with fallback.
 *
 * @param provider - Ethereum provider
 * @param multiplier - Gas price multiplier for faster confirmation (default: 1.0)
 * @returns Promise resolving to gas price as BigNumber
 *
 * @example
 * ```typescript
 * const provider = ethers.provider
 * const gasPrice = await getGasPrice(provider, 1.2) // 20% higher for faster tx
 * ```
 */
export async function getGasPrice(provider: providers.Provider, multiplier: number = 1.0): Promise<BigNumber> {
  try {
    const gasPrice = await provider.getGasPrice();
    const adjusted = gasPrice.mul(Math.floor(multiplier * 100)).div(100);
    return adjusted;
  } catch (error) {
    throw new Error(`Failed to get gas price: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Estimate gas limit for transaction with buffer.
 *
 * @param estimatedGas - Estimated gas from eth_estimateGas
 * @param buffer - Buffer multiplier for safety (default: 1.2 = 20% buffer)
 * @returns Adjusted gas limit as number
 *
 * @example
 * ```typescript
 * const estimated = await contract.estimateGas.deploy()
 * const gasLimit = estimateGasLimit(estimated, 1.3) // 30% buffer
 * ```
 */
export function estimateGasLimit(estimatedGas: BigNumber | number, buffer: number = 1.2): number {
  const gas = typeof estimatedGas === "number" ? estimatedGas : estimatedGas.toNumber();
  return Math.floor(gas * buffer);
}

/**
 * Extract revert reason from transaction error.
 *
 * @param error - Error object from failed transaction
 * @returns Human-readable revert reason or generic error message
 *
 * @example
 * ```typescript
 * try {
 *   await contract.someFunction()
 * } catch (error) {
 *   console.error(extractRevertReason(error))
 * }
 * ```
 */
export function extractRevertReason(error: unknown): string {
  if (!error) {
    return "Unknown error";
  }

  // Handle ethers.js errors
  if (typeof error === "object" && error !== null && "reason" in error && typeof error.reason === "string") {
    return error.reason;
  }

  // Handle error with data property
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  // Handle error with message property
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Options for retry transaction logic.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default: 2000 for Hedera) */
  baseDelay?: number;
  /** Maximum delay cap in milliseconds (default: 16000) */
  maxDelay?: number;
  /** Whether to log retry attempts (default: true) */
  logRetries?: boolean;
}

/**
 * Default retry options optimized for Hedera network.
 * Reduced from previous values for faster failure feedback (<2min worst-case).
 * Old values: maxRetries: 3, baseDelay: 2000, maxDelay: 16000
 */
export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2, // 3 total attempts
  baseDelay: 1000, // 1 second base delay
  maxDelay: 4000, // Cap at 4 seconds (delays: 1s → 2s → 4s)
  logRetries: true,
};

/**
 * Retry a transaction function with exponential backoff.
 * Optimized for Hedera network with longer delays and error-specific handling.
 *
 * @param fn - Async function that returns a transaction
 * @param options - Retry configuration options
 * @returns Promise resolving to transaction result
 * @throws Error if all retries fail
 *
 * @example
 * ```typescript
 * const tx = await retryTransaction(
 *   async () => contract.deploy(...args),
 *   { maxRetries: 3, baseDelay: 2000 }
 * )
 * ```
 */
export async function retryTransaction<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, logRetries } = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0 && logRetries) {
        info(`Retry attempt ${attempt}/${maxRetries}...`);
      }
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error || "Unknown error"));

      if (attempt < maxRetries) {
        // Calculate exponential backoff delay with max cap
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const delay = Math.min(exponentialDelay, maxDelay);

        // Add extra delay for specific error types
        const adjustedDelay = adjustDelayForErrorType(error, delay);

        if (logRetries) {
          warn(`Transaction failed: ${extractRevertReason(error)}`);
          debug(`Waiting ${adjustedDelay}ms before retry...`);
        }

        await new Promise((resolve) => setTimeout(resolve, adjustedDelay));
        continue;
      }
    }
  }

  throw new Error(`Transaction failed after ${maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`);
}

/**
 * Adjust retry delay based on error type.
 * Hedera rate limit errors benefit from longer delays.
 *
 * @param error - The error that occurred
 * @param baseDelay - The calculated exponential backoff delay
 * @returns Adjusted delay in milliseconds
 */
function adjustDelayForErrorType(error: unknown, baseDelay: number): number {
  const message = extractRevertReason(error).toLowerCase();

  // Hedera rate limit errors - add extra delay
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return baseDelay * 1.5;
  }

  // Network errors - moderate delay increase
  if (isNetworkError(error)) {
    return baseDelay * 1.2;
  }

  // Gas errors - use base delay (retry quickly)
  if (isGasError(error)) {
    return baseDelay;
  }

  return baseDelay;
}

/**
 * Format gas usage for logging.
 *
 * @param receipt - Transaction receipt
 * @param gasLimit - Optional gas limit from original transaction
 * @returns Formatted string with gas usage details
 *
 * @example
 * ```typescript
 * const receipt = await tx.wait()
 * console.log(formatGasUsage(receipt))
 * // "Gas used: 123,456"
 * console.log(formatGasUsage(receipt, tx.gasLimit))
 * // "Gas used: 123,456 (12.35% of limit 1,000,000)"
 * ```
 */
export function formatGasUsage(receipt: ContractReceipt, gasLimit?: BigNumber): string {
  const gasUsed = receipt.gasUsed.toNumber();

  if (!gasLimit) {
    return `Gas used: ${gasUsed.toLocaleString()}`;
  }

  const limit = gasLimit.toNumber();
  const percentage = ((gasUsed / limit) * 100).toFixed(2);

  return `Gas used: ${gasUsed.toLocaleString()} (${percentage}% of limit ${limit.toLocaleString()})`;
}

/**
 * Check if error is a nonce too low error.
 *
 * @param error - Error to check
 * @returns true if error is nonce-related
 */
export function isNonceTooLowError(error: unknown): boolean {
  const message = extractRevertReason(error).toLowerCase();
  return message.includes("nonce") && (message.includes("too low") || message.includes("already used"));
}

/**
 * Check if error is a gas-related error.
 *
 * @param error - Error to check
 * @returns true if error is gas-related
 */
export function isGasError(error: unknown): boolean {
  const message = extractRevertReason(error).toLowerCase();
  return (
    message.includes("out of gas") ||
    message.includes("gas required exceeds") ||
    message.includes("insufficient funds for gas")
  );
}

/**
 * Check if error is a network connectivity error.
 *
 * @param error - Error to check
 * @returns true if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  const message = extractRevertReason(error).toLowerCase();
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("econnrefused")
  );
}
