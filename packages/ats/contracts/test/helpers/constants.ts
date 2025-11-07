// SPDX-License-Identifier: Apache-2.0

/**
 * Test-specific constants for integration tests.
 *
 * These constants provide semantic meaning to numeric values used in tests,
 * making test intent clearer and reducing magic numbers.
 *
 * @module test/helpers/constants
 */

/**
 * Common test array sizes for facet operations.
 *
 * These represent typical batch sizes used across integration tests
 * for deploying, registering, and configuring facets.
 */
export const TEST_SIZES = {
  /** Single facet operation */
  SINGLE: 1,

  /** Two facets (dual/pair) */
  DUAL: 2,

  /** Three facets (triple) */
  TRIPLE: 3,

  /** Small batch (5 facets) */
  SMALL_BATCH: 5,

  /** Medium batch (10 facets) */
  MEDIUM_BATCH: 10,

  /** Large batch (12 facets) */
  LARGE_BATCH: 12,
} as const;

/**
 * BLR (Business Logic Resolver) version constants.
 *
 * Used for testing version increments when registering facets.
 */
export const BLR_VERSIONS = {
  /** Initial version after deployment */
  INITIAL: 0,

  /** First version after registering facets */
  FIRST: 1,

  /** Second version after subsequent registration */
  SECOND: 2,
} as const;
