// SPDX-License-Identifier: Apache-2.0

/**
 * Transaction utilities: coverage gas override, bounded waits, revert-reason
 * extraction, and retry with exponential backoff.
 */

import { ContractRunner, ContractTransactionResponse, ContractTransactionReceipt, NonceManager } from "ethers";
import { DEFAULT_TRANSACTION_TIMEOUT } from "../constants";

/**
 * Check if network uses instant mining (transactions mined instantly, no delays
 * or batching needed). Instant: hardhat, local. NOT instant: hedera-local.
 */
export function isInstantMiningNetwork(network: string): boolean {
  return network === "hardhat" || network === "local";
}

/**
 * Returns `{}` under normal operation so the provider estimates gas itself.
 * Under solidity-coverage (`COVERAGE=true`), contracts are instrumented and grow
 * substantially, so a fixed high limit replaces auto-estimation — the
 * auto-estimate is based on the unmodified bytecode and will be too low.
 * 30M sits well within the 300M blockGasLimit configured for coverage runs.
 */
export function gasLimitOverride(): { gasLimit: number } | Record<string, never> {
  return process.env.COVERAGE ? { gasLimit: 30_000_000 } : {};
}

/**
 * Wait until the transaction is mined (1 confirmation); throws if it reverts
 * (status=0) or times out. Always exactly 1: every target network (Hedera,
 * Besu QBFT, Hardhat) has instant finality, so more buys nothing — and 0 is
 * a trap (ethers' `tx.wait(0)` resolves immediately with a null receipt,
 * which reads as a failure and triggers duplicate re-sends).
 */
export async function waitForTransaction(
  tx: ContractTransactionResponse,
  timeout: number = DEFAULT_TRANSACTION_TIMEOUT,
): Promise<ContractTransactionReceipt> {
  let receipt: ContractTransactionReceipt | null;
  try {
    receipt = await Promise.race([
      tx.wait(1),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Transaction timeout")), timeout).unref?.()),
    ]);
  } catch (error) {
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!receipt || receipt.status === 0) {
    throw new Error(`Transaction reverted (status=0): ${tx.hash}`);
  }

  return receipt;
}

/** Extract a human-readable revert reason from a transaction error. */
export function extractRevertReason(error: unknown): string {
  if (!error) {
    return "Unknown error";
  }

  // ethers.js errors carry the decoded reason
  if (typeof error === "object" && error !== null && "reason" in error && typeof error.reason === "string") {
    return error.reason;
  }

  // provider errors sometimes nest the message under data
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

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 2, i.e. 3 total attempts) */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default: 1000) */
  baseDelay?: number;
  /** Maximum delay cap in milliseconds (default: 4000; delays 1s → 2s → 4s) */
  maxDelay?: number;
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

const DEFAULT_RETRY_OPTIONS: Omit<Required<RetryOptions>, "onRetry"> = {
  maxRetries: 2,
  baseDelay: 1000,
  maxDelay: 4000,
};

/** Retry a transaction function with exponential backoff (tuned for Hedera). */
export async function retryTransaction<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, onRetry } = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error || "Unknown error"));

      if (attempt < maxRetries) {
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const delay = adjustDelayForErrorType(error, exponentialDelay);

        await onRetry?.(error, attempt); // resync state (e.g. nonce reset)
        await new Promise((resolve) => setTimeout(resolve, delay));
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

/** Adjust retry delay based on error type (Hedera throttle/rate-limit errors wait longer). */
function adjustDelayForErrorType(error: unknown, baseDelay: number): number {
  if (isHederaThrottleError(error)) {
    return baseDelay * 5;
  }

  const message = extractRevertReason(error).toLowerCase();
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return baseDelay * 1.5;
  }
  if (isNetworkError(error)) {
    return baseDelay * 1.2;
  }
  return baseDelay;
}

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
 */
function isHederaThrottleError(error: unknown): boolean {
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

/** Check if error is a network connectivity error. */
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
