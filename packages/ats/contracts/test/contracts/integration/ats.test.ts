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
import { freezeTests } from "./freeze/freeze.test";
import { deactivateTests } from "./deactivate/deactivate.test";
import { operatorTests } from "./operator/operator.test";
import { eip712Tests } from "./eip712/eip712.test";
import { noncesTests } from "./nonces/nonces.test";
import { controlListTests } from "./controlList/controlList.test";

// ── W2: Multi-partition suites ──────────────────────────────────────────
import { holdAtSnapshotTests } from "./holdAtSnapshot/holdAtSnapshot.test";
import { lockAtSnapshotTests } from "./lockAtSnapshot/lockAtSnapshot.test";
import { lockAtSnapshotByPartitionTests } from "./lockAtSnapshotByPartition/lockAtSnapshotByPartition.test";
import { balanceTrackerAdjustedTests } from "./balanceTrackerAdjusted/balanceTrackerAdjusted.test";
import { balanceTrackerAtSnapshotByPartitionTests } from "./balanceTrackerAtSnapshotByPartition/balanceTrackerAtSnapshotByPartition.test";
import { balanceTrackerAtSnapshotTests } from "./balanceTrackerAtSnapshot/balanceTrackerAtSnapshot.test";
import { snapshotsByPartitionTests } from "./snapshotsByPartition/snapshotsByPartition.test";
import { votingSecurityHoldersTests } from "./votingSecurityHolders/votingSecurityHolders.test";
import { transferAndLockByPartitionTests } from "./transferAndLockByPartition/transferAndLockByPartition.test";

describe("ATS — IAsset Suites", () => {
  // ── W1: Generic single-partition suites ──────────────────────────────
  accessControlTests();
  freezeTests();
  deactivateTests();
  operatorTests();
  eip712Tests();
  noncesTests();
  controlListTests();

  // ── W2: Multi-partition suites ──────────────────────────────────────
  holdAtSnapshotTests();
  lockAtSnapshotTests();
  lockAtSnapshotByPartitionTests();
  balanceTrackerAdjustedTests();
  balanceTrackerAtSnapshotByPartitionTests();
  balanceTrackerAtSnapshotTests();
  snapshotsByPartitionTests();
  votingSecurityHoldersTests();
  transferAndLockByPartitionTests();
});
