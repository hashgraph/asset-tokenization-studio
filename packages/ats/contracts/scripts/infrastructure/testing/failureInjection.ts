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
 * Parse failure injection configuration from environment variables.
 *
 * Supports two formats:
 * - New unified format: `CHECKPOINT_TEST_FAIL_AT=<type>:<target>`
 *   - `facet:50` - Fail after deploying 50 facets
 *   - `facet:ERC20Facet` - Fail after deploying specific facet
 *   - `step:blr` - Fail at workflow step
 * - Legacy format: `FAIL_AT_FACET=50` - Fail after deploying 50 facets
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
  const failAtEnv = process.env[CHECKPOINT_TEST_FAIL_AT_ENV];
  const legacyFailAtFacet = process.env[LEGACY_FAIL_AT_FACET_ENV];

  // Try new unified format first
  if (failAtEnv) {
    const colonIndex = failAtEnv.indexOf(":");
    if (colonIndex === -1) {
      // Invalid format - no colon separator
      return null;
    }

    const type = failAtEnv.substring(0, colonIndex);
    const targetStr = failAtEnv.substring(colonIndex + 1);

    if (type === "facet") {
      const numTarget = Number(targetStr);
      const target = isNaN(numTarget) ? targetStr : numTarget;
      return { type: "facet", target };
    }

    if (type === "step") {
      return { type: "step", target: targetStr };
    }

    // Unknown type
    return null;
  }

  // Fall back to legacy format
  if (legacyFailAtFacet) {
    const numTarget = parseInt(legacyFailAtFacet, 10);
    if (!isNaN(numTarget)) {
      return { type: "facet", target: numTarget };
    }
  }

  return null;
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
