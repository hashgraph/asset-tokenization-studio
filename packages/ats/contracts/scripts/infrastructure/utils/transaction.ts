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

/**
 * Wait for transaction confirmation with retry logic.
 *
 * @param tx - Transaction to wait for
 * @param confirmations - Number of confirmations to wait for (default: 1)
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
  confirmations: number = 1,
  timeout: number = 120000,
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
 * Retry a transaction function with exponential backoff.
 *
 * @param fn - Async function that returns a transaction
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds for exponential backoff (default: 1000)
 * @returns Promise resolving to transaction result
 * @throws Error if all retries fail
 *
 * @example
 * ```typescript
 * const tx = await retryTransaction(
 *   async () => contract.deploy(...args),
 *   3,
 *   2000
 * )
 * ```
 */
export async function retryTransaction<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error || "Unknown error"));

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw new Error(`Transaction failed after ${maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`);
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
