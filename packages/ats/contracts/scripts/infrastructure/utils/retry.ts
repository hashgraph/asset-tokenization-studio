// SPDX-License-Identifier: Apache-2.0

/**
 * Retry utility with exponential backoff for deployment operations.
 *
 * Provides resilient retry logic for network operations that may fail
 * due to transient errors like timeouts, rate limits, or nonce issues.
 *
 * @module infrastructure/utils/retry
 */

import { warn, info } from "./logging";

/**
 * Configuration options for retry behavior.
 */
export interface WithRetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;

  /** Initial delay between retries in milliseconds (default: 1000) */
  initialDelayMs?: number;

  /** Maximum delay between retries in milliseconds (default: 30000) */
  maxDelayMs?: number;

  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;

  /** Error patterns that should trigger a retry */
  retryableErrors?: string[];

  /** Operation name for logging (optional) */
  operationName?: string;
}

/**
 * Default patterns for errors that should trigger retry.
 * These are common transient errors in blockchain deployments.
 */
export const DEFAULT_RETRYABLE_ERRORS = [
  // Network errors
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ENETUNREACH",
  "socket hang up",

  // Rate limiting
  "RATE_LIMIT",
  "rate limit",
  "429",
  "Too Many Requests",

  // Nonce errors (often resolvable with retry)
  "nonce too low",
  "replacement transaction underpriced",
  "already known",
  "transaction already in mempool",

  // RPC errors
  "failed to meet quorum",
  "Internal JSON-RPC error",
  "server returned an error",
  "missing response",

  // Hedera-specific
  "BUSY",
  "PLATFORM_TRANSACTION_NOT_CREATED",
];

/**
 * Default retry options.
 */
const DEFAULT_RETRY_OPTIONS: Required<Omit<WithRetryOptions, "operationName">> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: DEFAULT_RETRYABLE_ERRORS,
};

/**
 * Sleep for specified milliseconds.
 *
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable based on configured patterns.
 *
 * @param error - Error to check
 * @param patterns - Patterns to match against
 * @returns True if error matches any retryable pattern
 */
function isRetryableError(error: Error, patterns: string[]): boolean {
  const message = error.message.toLowerCase();
  return patterns.some((pattern) => message.includes(pattern.toLowerCase()));
}

/**
 * Execute an operation with retry logic and exponential backoff.
 *
 * Retries on transient errors (network, rate limits, nonce issues)
 * with configurable backoff strategy.
 *
 * @param operation - Async operation to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to operation result
 * @throws Last error if all retries fail
 *
 * @example
 * ```typescript
 * // Basic usage with defaults
 * const result = await withRetry(() => deployContract(factory, args));
 *
 * // Custom retry configuration
 * const result = await withRetry(
 *   () => deployContract(factory, args),
 *   {
 *     maxRetries: 5,
 *     initialDelayMs: 2000,
 *     operationName: 'Deploy AccessControlFacet'
 *   }
 * );
 *
 * // Adding custom retryable errors
 * const result = await withRetry(
 *   () => deployContract(factory, args),
 *   {
 *     retryableErrors: [...DEFAULT_RETRYABLE_ERRORS, 'custom error pattern']
 *   }
 * );
 * ```
 */
export async function withRetry<T>(operation: () => Promise<T>, options: WithRetryOptions = {}): Promise<T> {
  const opts = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: Error | undefined;
  let delay = opts.initialDelayMs;

  const totalAttempts = opts.maxRetries + 1;
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if this is the last attempt
      if (attempt >= totalAttempts) {
        throw lastError;
      }

      // Check if error is retryable
      const isRetryable = isRetryableError(lastError, opts.retryableErrors);

      if (!isRetryable) {
        // Non-retryable error - throw immediately
        throw lastError;
      }

      // Log retry attempt
      const opName = opts.operationName ? `[${opts.operationName}] ` : "";
      warn(`${opName}Attempt ${attempt}/${totalAttempts} failed: ${lastError.message}`);
      info(`${opName}Retrying in ${delay}ms...`);

      // Wait before retry
      await sleep(delay);

      // Calculate next delay with exponential backoff
      const jitter = delay * 0.1 * Math.random();
      delay = Math.min(delay * opts.backoffMultiplier + jitter, opts.maxDelayMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Create a retry-wrapped version of an async function.
 *
 * Useful for wrapping existing functions with retry behavior.
 *
 * @param fn - Async function to wrap
 * @param options - Retry configuration options
 * @returns Wrapped function with retry behavior
 *
 * @example
 * ```typescript
 * const deployWithRetry = withRetryFn(deployContract, {
 *   maxRetries: 5,
 *   operationName: 'deployContract'
 * });
 *
 * // Now all calls to deployWithRetry will have retry behavior
 * const result = await deployWithRetry(factory, args);
 * ```
 */
export function withRetryFn<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: WithRetryOptions = {},
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}
