// SPDX-License-Identifier: Apache-2.0

/**
 * Testing utilities for infrastructure layer.
 *
 * Provides utilities for testing deployment workflows, including
 * failure injection for checkpoint recovery testing.
 *
 * @module infrastructure/testing
 */

export {
  parseFailureConfig,
  resetFailureConfig,
  shouldFailAtStep,
  shouldFailAtFacet,
  createTestFailureMessage,
  isTestFailureError,
  SUPPORTED_STEPS,
  CHECKPOINT_TEST_FAIL_AT_ENV,
  LEGACY_FAIL_AT_FACET_ENV,
  type FailureConfig,
  type SupportedStep,
} from "./failureInjection";
