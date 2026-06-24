// SPDX-License-Identifier: Apache-2.0

/**
 * Transaction utilities for ATS deployment system.
 *
 * Provides reusable functions for transaction handling, gas estimation,
 * and error recovery during contract deployments.
 *
 * @module core/utils/transaction
 */

import {
  ContractRunner,
  ContractTransactionResponse,
  ContractTransactionReceipt,
  NonceManager,
  Provider,
} from "ethers";
import { DEFAULT_TRANSACTION_TIMEOUT, GAS_LIMIT } from "../constants";
import { isInstantMiningNetwork } from "../networkConfig";
import { info, warn, debug } from "./logging";

/**
 * Returns `{ gasLimit: limit }` under normal operation.
 * Under solidity-coverage (`COVERAGE=true`), contracts are instrumented and grow
 * substantially, so we use a higher fixed limit instead of auto-estimation — the
 * auto-estimate is based on the unmodified bytecode and will be too low.
 * 100M gives headroom for the heaviest instrumented deploy tx (the v8.0.0 system
 * deploy exceeded the previous 30M) while staying well under the 300M coverage blockGasLimit.
 */
export function gasLimitOverride(limit: number): { gasLimit: number } {
  return { gasLimit: process.env.COVERAGE ? 100_000_000 : limit };
}

/**
 * Returns `{ gasPrice: GAS_LIMIT.gasPrice }` on real networks (Hedera) and `{}`
 * on instant-mining networks (Hardhat/local).
 *
 * Use this anywhere an explicit gasPrice is needed to skip eth_estimateGas on
 * Hedera without inflating fake ETH costs in Hardhat tests.
 */
export function hederaGasOverrides(): { gasPrice: bigint } | Record<string, never> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const hre = require("hardhat");
    if (isInstantMiningNetwork(hre?.network?.name ?? "unknown")) {
      return {};
    }
  } catch {
    // Not running inside Hardhat (e.g. standalone tsx script) — use Hedera price
  }
  return { gasPrice: GAS_LIMIT.gasPrice };
}

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
 * @returns Promise resolving to ContractTransactionReceipt
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
  tx: ContractTransactionResponse,
  confirmations: number = DEFAULT_TRANSACTION_CONFIRMATIONS,
  timeout: number = DEFAULT_TRANSACTION_TIMEOUT,
): Promise<ContractTransactionReceipt> {
  let receipt: ContractTransactionReceipt | null;
  try {
    receipt = await Promise.race([
      tx.wait(confirmations),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Transaction timeout")), timeout)),
    ]);
  } catch (error) {
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!receipt || receipt.status === 0) {
    throw new Error(`Transaction reverted (status=0): ${tx.hash}`);
  }

  return receipt;
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
export async function getGasPrice(provider: Provider, multiplier: number = 1.0): Promise<bigint> {
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice ?? 0n;
    const adjusted = (gasPrice * BigInt(Math.floor(multiplier * 100))) / 100n;
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
export function estimateGasLimit(estimatedGas: bigint | number, buffer: number = 1.2): number {
  const gas = typeof estimatedGas === "number" ? estimatedGas : Number(estimatedGas);
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
  /**
   * Optional hook called after each failure and before the retry delay.
   * The hook is awaited, so async work here extends the total wait time.
   *
   * Primary use: call NonceManager.reset() to discard the stale internal nonce
   * delta that ethers accumulates when a 502 aborts sendTransaction before Hedera
   * confirms receipt. Without a reset the next attempt uses nonce N+1 while the
   * network still expects N, causing a "Wrong Nonce" rejection.
   */
  onRetry?: (error: unknown, attempt: number) => void | Promise<void>;
}

/**
 * Default retry options optimized for Hedera network.
 * Reduced from previous values for faster failure feedback (<2min worst-case).
 * Old values: maxRetries: 3, baseDelay: 2000, maxDelay: 16000
 */
export const DEFAULT_RETRY_OPTIONS: Omit<Required<RetryOptions>, "onRetry"> = {
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
  const { maxRetries, baseDelay, maxDelay, logRetries, onRetry } = { ...DEFAULT_RETRY_OPTIONS, ...options };
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

        // Resync state
        await onRetry?.(error, attempt);

        await new Promise((resolve) => setTimeout(resolve, adjustedDelay));
        continue;
      }
    }
  }

  throw new Error(`Transaction failed after ${maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`);
}

/**
 * Build retry options that reset the {@link NonceManager} (if any) before each retry.
 *
 * On Hedera, a 502 from the JSON-RPC relay can abort `sendTransaction` after ethers
 * has bumped the NonceManager's internal delta but before the network observed the tx.
 * The next attempt would then use nonce N+1 while Hedera still expects N, causing a
 * "Wrong Nonce" rejection. Calling `NonceManager.reset()` forces the next
 * `sendTransaction` to re-fetch the confirmed nonce from the network.
 *
 * If `runner` is not a NonceManager (plain Wallet, null, undefined, etc.) the caller's
 * options are returned unchanged.
 *
 * NOTE: If `options.onRetry` is set, it is replaced by the reset callback — callers
 * that need to compose their own `onRetry` should wire it manually.
 *
 * @param runner - ContractRunner driving the transaction (e.g. `signer`, `contract.runner`)
 * @param options - Caller-supplied retry options
 * @returns Retry options with `onRetry` wired up when applicable
 */
export function withNonceReset(runner: ContractRunner | null | undefined, options?: RetryOptions): RetryOptions {
  const base = options ?? {};
  if (!(runner instanceof NonceManager)) {
    return base;
  }
  return {
    ...base,
    onRetry: () => {
      runner.reset();
    },
  };
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
  // Hedera network - high delay
  if (isHederaThrottleError(error)) {
    return baseDelay * 5;
  }

  const message = extractRevertReason(error).toLowerCase();
  // Rate limit errors - add extra delay
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
export function formatGasUsage(receipt: ContractTransactionReceipt, gasLimit?: bigint): string {
  const gasUsed = Number(receipt.gasUsed);

  if (!gasLimit) {
    return `Gas used: ${gasUsed.toLocaleString()}`;
  }

  const limit = Number(gasLimit);
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
/**
 * Check if error is a Hedera consensus-layer pre-execution rejection.
 *
 * On Hedera, when the per-account contract-creation throttle fires the node mines
 * the transaction but rejects it before the EVM runs: status=0, gasUsed=0,
 * contractAddress=null. This is NOT an EVM revert (which shows gasUsed > 0).
 *
 * NOTE: This heuristic is scoped to contract-deployment transactions. A non-deployment
 * transaction that genuinely consumes 0 gas (e.g. a precompile call) could produce
 * the same receipt shape and trigger a false-positive. Do not use this check in
 * non-deployment retry contexts without adding an additional deployment-specific guard.
 *
 * @param error - Error to check
 * @returns true if the mined receipt shows status=0 and gasUsed=0
 */
export function isHederaThrottleError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "receipt" in error) {
    const receipt = (error as Record<string, unknown>).receipt;
    if (
      receipt !== null &&
      typeof receipt === "object" &&
      "gasUsed" in receipt &&
      "status" in receipt &&
      "contractAddress" in receipt &&
      String((receipt as Record<string, unknown>).gasUsed) === "0" &&
      (receipt as Record<string, unknown>).status === 0 &&
      (receipt as Record<string, unknown>).contractAddress === null
    ) {
      return true;
    }
  }
  return false;
}

export function isNetworkError(error: unknown): boolean {
  const message = extractRevertReason(error).toLowerCase();
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("econnrefused") ||
    // ethers v6 HTTP-layer errors — "server response 502 Bad Gateway", code=SERVER_ERROR, etc.
    message.includes("bad gateway") ||
    message.includes("server_error") ||
    message.includes("server error") ||
    /\b5\d\d\b/.test(message) // any 5xx status code
  );
}
