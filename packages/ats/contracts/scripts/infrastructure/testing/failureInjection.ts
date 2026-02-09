// SPDX-License-Identifier: Apache-2.0

/**
 * Failure injection utilities for checkpoint testing.
 *
 * Provides a generalized mechanism to simulate failures at various points
 * during deployment workflows, enabling comprehensive checkpoint recovery testing.
 *
 * @module infrastructure/testing/failureInjection
 *
 * @example
 * ```bash
 * # Fail after deploying 50 facets
 * CHECKPOINT_TEST_FAIL_AT=facet:50 npm run deploy:newBlr
 *
 * # Fail after specific facet
 * CHECKPOINT_TEST_FAIL_AT=facet:ERC20Facet npm run deploy:newBlr
 *
 * # Fail at workflow step
 * CHECKPOINT_TEST_FAIL_AT=step:equity npm run deploy:newBlr
 * ```
 */

/**
 * Failure injection configuration parsed from environment variable.
 */
export interface FailureConfig {
  /** Type of failure injection */
  type: "facet" | "step";
  /** Target for failure: facet count (number), facet name (string), or step name (string) */
  target: string | number;
}

/**
 * Supported workflow steps for step-level failure injection.
 */
export const SUPPORTED_STEPS = [
  "proxyAdmin",
  "blr",
  "facets",
  "register",
  "equity",
  "bond",
  "bondFixedRate",
  "bondKpiLinkedRate",
  "bondSustainabilityPerformanceTargetRate",
  "factory",
] as const;

export type SupportedStep = (typeof SUPPORTED_STEPS)[number];

/**
 * Environment variable name for failure injection configuration.
 */
export const CHECKPOINT_TEST_FAIL_AT_ENV = "CHECKPOINT_TEST_FAIL_AT";

/**
 * Legacy environment variable for facet-specific failure (backward compatibility).
 */
export const LEGACY_FAIL_AT_FACET_ENV = "FAIL_AT_FACET";

/**
 * Cached failure configuration to avoid re-parsing env vars on every call.
 * - `undefined` means "not yet parsed"
 * - `null` means "parsed but no config found"
 * - Object means "parsed and found a config"
 * @internal
 */
let _cachedFailureConfig: FailureConfig | null | undefined;

/**
 * Parse failure injection configuration from environment variables.
 *
 * Supports two formats:
 * - New unified format: `CHECKPOINT_TEST_FAIL_AT=<type>:<target>`
 *   - `facet:50` - Fail after deploying 50 facets
 *   - `facet:ERC20Facet` - Fail after deploying specific facet
 *   - `step:blr` - Fail at workflow step
 * - Legacy format: `FAIL_AT_FACET=50` - Fail after deploying 50 facets
 *
 * Results are cached to avoid re-parsing environment variables on repeated calls.
 * Call `resetFailureConfig()` to clear the cache (e.g., between tests when env vars change).
 *
 * @returns Parsed failure configuration or null if not configured
 *
 * @example
 * ```typescript
 * // With CHECKPOINT_TEST_FAIL_AT=facet:50
 * const config = parseFailureConfig();
 * // config = { type: 'facet', target: 50 }
 *
 * // With CHECKPOINT_TEST_FAIL_AT=step:blr
 * const config = parseFailureConfig();
 * // config = { type: 'step', target: 'blr' }
 *
 * // With legacy FAIL_AT_FACET=10
 * const config = parseFailureConfig();
 * // config = { type: 'facet', target: 10 }
 * ```
 */
export function parseFailureConfig(): FailureConfig | null {
  // Return cached result if already parsed
  if (_cachedFailureConfig !== undefined) {
    return _cachedFailureConfig;
  }

  const failAtEnv = process.env[CHECKPOINT_TEST_FAIL_AT_ENV];
  const legacyFailAtFacet = process.env[LEGACY_FAIL_AT_FACET_ENV];

  let result: FailureConfig | null = null;

  // Try new unified format first
  if (failAtEnv) {
    const colonIndex = failAtEnv.indexOf(":");
    if (colonIndex === -1) {
      // Invalid format - no colon separator
      result = null;
    } else {
      const type = failAtEnv.substring(0, colonIndex);
      const targetStr = failAtEnv.substring(colonIndex + 1);

      if (type === "facet") {
        const numTarget = Number(targetStr);
        const target = isNaN(numTarget) ? targetStr : numTarget;
        result = { type: "facet", target };
      } else if (type === "step") {
        result = { type: "step", target: targetStr };
      } else {
        // Unknown type
        result = null;
      }
    }
  } else if (legacyFailAtFacet) {
    // Fall back to legacy format
    const numTarget = parseInt(legacyFailAtFacet, 10);
    if (!isNaN(numTarget)) {
      result = { type: "facet", target: numTarget };
    }
  }

  // Cache the result before returning
  _cachedFailureConfig = result;
  return result;
}

/**
 * Reset cached failure configuration.
 *
 * Call this between tests to ensure environment variable changes are picked up
 * by subsequent calls to `parseFailureConfig()`.
 *
 * @internal - Only for testing
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   resetFailureConfig(); // Clear cache so next test reads fresh env vars
 * });
 * ```
 */
export function resetFailureConfig(): void {
  _cachedFailureConfig = undefined;
}

/**
 * Check if deployment should fail at the specified workflow step.
 *
 * @param stepName - Name of the current workflow step
 * @returns True if deployment should fail at this step
 *
 * @example
 * ```typescript
 * // With CHECKPOINT_TEST_FAIL_AT=step:equity
 * if (shouldFailAtStep('equity')) {
 *   throw new Error('[TEST] Intentional failure at equity step');
 * }
 * ```
 */
export function shouldFailAtStep(stepName: string): boolean {
  const config = parseFailureConfig();
  if (!config || config.type !== "step") {
    return false;
  }
  return config.target === stepName;
}

/**
 * Check if deployment should fail after deploying a specific facet.
 *
 * @param deployedCount - Number of facets deployed so far
 * @param facetName - Name of the facet just deployed
 * @returns True if deployment should fail after this facet
 *
 * @example
 * ```typescript
 * // With CHECKPOINT_TEST_FAIL_AT=facet:50
 * if (shouldFailAtFacet(deployed.size, facetName)) {
 *   // Return partial result for checkpoint testing
 *   return { success: false, deployed, failed, skipped };
 * }
 *
 * // With CHECKPOINT_TEST_FAIL_AT=facet:ERC20Facet
 * if (shouldFailAtFacet(deployed.size, 'ERC20Facet')) {
 *   // Fails after ERC20Facet is deployed
 * }
 * ```
 */
export function shouldFailAtFacet(deployedCount: number, facetName: string): boolean {
  const config = parseFailureConfig();
  if (!config || config.type !== "facet") {
    return false;
  }

  if (typeof config.target === "number") {
    return deployedCount === config.target;
  }

  return facetName === config.target;
}

/**
 * Create the test error message for failure injection.
 *
 * @param type - Type of failure (facet or step)
 * @param target - Target that triggered the failure
 * @param context - Optional additional context
 * @returns Formatted test error message
 */
export function createTestFailureMessage(type: "facet" | "step", target: string | number, context?: string): string {
  const contextSuffix = context ? ` (${context})` : "";
  if (type === "facet") {
    if (typeof target === "number") {
      return `[TEST] Intentional failure after deploying facet #${target}${contextSuffix} for checkpoint testing`;
    }
    return `[TEST] Intentional failure after deploying ${target}${contextSuffix} for checkpoint testing`;
  }
  return `[TEST] Intentional failure at ${target} step${contextSuffix} for checkpoint testing`;
}

/**
 * Check if an error message is from failure injection.
 *
 * @param message - Error message to check
 * @returns True if the error is from intentional failure injection
 */
export function isTestFailureError(message: string): boolean {
  return message.startsWith("[TEST] Intentional failure");
}
