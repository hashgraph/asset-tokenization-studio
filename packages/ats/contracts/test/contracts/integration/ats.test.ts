// SPDX-License-Identifier: Apache-2.0

/**
 * ATS Contract Suite — Single entry point for IAsset tests.
 *
 * Suite files no longer self-register via top-level `describe`. Instead, they
 * export a `xTests()` function that registers a `describe` block when invoked
 * from this tree. Kept under the existing glob (`./test/contracts/integration`)
 * so Mocha discovers this single file — no hardhat config changes needed yet.
 *
 * @see openspec/changes/test-optimization-shared-fixtures
 */

// ── Migrated suites (W1+) ─────────────────────────────────────────────
import { accessControlTests } from "./accessControl/accessControl.test";

describe("ATS — IAsset Suites", () => {
  // ── W1: Generic single-partition suites ──────────────────────────────
  describe("Access Control", () => {
    accessControlTests();
  });
});
