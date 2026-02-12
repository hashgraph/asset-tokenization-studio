// SPDX-License-Identifier: Apache-2.0

/**
 * Test setup utilities for configuring test environment.
 *
 * Provides shared setup functions to reduce boilerplate across test files.
 *
 * @module test/helpers/testSetup
 */

import { configureLogger, LogLevel } from "@scripts/infrastructure";

/**
 * Silence script logging output during tests.
 *
 * Use this in a `before` hook to suppress log output from script infrastructure
 * operations, keeping test output clean.
 *
 * @example
 * ```typescript
 * import { silenceScriptLogging } from "@test";
 *
 * describe("My Tests", () => {
 *   before(silenceScriptLogging);
 *
 *   it("should run without log noise", () => {
 *     // Script operations won't produce log output
 *   });
 * });
 * ```
 */
export function silenceScriptLogging(): void {
  configureLogger({ level: LogLevel.SILENT });
}
