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

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx } from "@test";

// ── Migrated suites (W1+) ─────────────────────────────────────────────
import { accessControlTests } from "./accessControl/accessControl.test";
import { freezeTests } from "./freeze/freeze.test";
import { deactivateTests } from "./deactivate/deactivate.test";
import { operatorTests } from "./operator/operator.test";
import { eip712Tests } from "./eip712/eip712.test";
import { noncesTests } from "./nonces/nonces.test";
import { controlListTests } from "./controlList/controlList.test";
import { kycTests } from "./kyc/kyc.test";
import { coreAtSnapshotTests } from "./coreAtSnapshot/coreAtSnapshot.test";
import { customDataTests } from "./customData/customData.test";
import { ssiTests } from "./ssi/ssi.test";
import { operatorByPartitionTests } from "./operatorByPartition/operatorByPartition.test";

// ── W1: Layer 1 suites ────────────────────────────────────────────
import { corporateActionsTests } from "./layer_1/corporateActions/corporateActions.test";
import { dividendSecurityHoldersTests } from "./layer_1/dividendSecurityHolders/dividendSecurityHolders.test";
import { documentationTests } from "./layer_1/documentation/documentation.test";
import { scheduledBalanceAdjustmentsTests } from "./layer_1/scheduledTasks/scheduledBalanceAdjustments/scheduledBalanceAdjustments.test";
import { freezeAtSnapshotTests } from "./layer_1/freezeAtSnapshot/freezeAtSnapshot.test";
import { freezeAtSnapshotByPartitionTests } from "./layer_1/freezeAtSnapshotByPartition/freezeAtSnapshotByPartition.test";
import { securityHoldersTests } from "./layer_2/SecurityHolders.test";
import { votingTests } from "./voting/voting.test";

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
  let ctx: Awaited<ReturnType<typeof deployAssetMockCtx>>;

  beforeEach(async () => {
    ctx = await loadFixture(deployAssetMockCtx);
  });

  // ── W1: Generic single-partition suites ──────────────────────────────
  accessControlTests(() => ctx);
  freezeTests(() => ctx);
  deactivateTests(() => ctx);
  operatorTests(() => ctx);
  eip712Tests(() => ctx);
  noncesTests(() => ctx);
  controlListTests(() => ctx);
  kycTests(() => ctx);
  coreAtSnapshotTests(() => ctx);
  customDataTests(() => ctx);
  ssiTests(() => ctx);
  operatorByPartitionTests(() => ctx);

  // ── W1: Layer 1 suites ────────────────────────────────────────────
  corporateActionsTests();
  dividendSecurityHoldersTests();
  documentationTests();
  scheduledBalanceAdjustmentsTests();
  freezeAtSnapshotTests();
  freezeAtSnapshotByPartitionTests();
  securityHoldersTests();
  votingTests(() => ctx);

  // ── W2: Multi-partition suites ──────────────────────────────────────
  holdAtSnapshotTests();
  lockAtSnapshotTests();
  lockAtSnapshotByPartitionTests();
  balanceTrackerAdjustedTests();
  balanceTrackerAtSnapshotByPartitionTests();
  balanceTrackerAtSnapshotTests();
  snapshotsByPartitionTests();
  votingSecurityHoldersTests();
  transferAndLockByPartitionTests(() => ctx);
});
