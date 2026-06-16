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

// ── W1: Balance adjustments and pause ────────────────────────────────
import { adjustBalancesFacetTests } from "./adjustBalances/adjustBalancesFacet.test";
import { pauseTests } from "./pause/pause.test";

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

// ── W2: layer_1 suites ────────────────────────────────────────────────
import { lockTests } from "./layer_1/lock/lock.test";
import { partitionsTests } from "./layer_1/partitions/partitions.test";
import { transferAndLockTests } from "./layer_1/transferAndLock/transferAndLock.test";
import { erc20PermitTests } from "./layer_1/ERC1400/ERC20Permit/erc20Permit.test";
import { externalControlListTests } from "./externalControlLists/externalControlList.test";
import { externalKycListTests } from "./externalKycLists/externalKycList.test";
import { externalPauseTests } from "./externalPauses/externalPause.test";
import { externalListSizeCapTests } from "./externalPauses/externalListSizeCap.test";

// ── W3: Cap / batch suites ──────────────────────────────────────────────
import { capTests } from "./cap/cap.test";
import { capByPartitionTests } from "./capByPartition/capByPartition.test";
import { batchMintTests } from "./batchMint/batchMint.test";
import { batchBurnTests } from "./batchBurn/batchBurn.test";
import { batchControllerTests } from "./batchController/batchController.test";
import { mintTests } from "./mint/mint.test";
import { mintByPartitionTests } from "./mintByPartition/mintByPartition.test";
import { burnByPartitionTests } from "./burnByPartition/burnByPartition.test";
import { lockByPartitionTests } from "./lockByPartition/lockByPartition.test";
import { batchFreezeTests } from "./batchFreeze/batchFreeze.test";

// ── W4: Clearing / balance / batch suites ───────────────────────────────
import { clearingAtSnapshotTests } from "./clearingAtSnapshot/clearingAtSnapshot.test";
import { balanceTrackerTests } from "./balanceTracker/balanceTracker.test";
import { batchTransferTests } from "./batchTransfer/batchTransfer.test";
import { transferTests } from "./transfer/transfer.test";
import { transferByPartitionTests } from "./transferByPartition/transferByPartition.test";
import { burnTests } from "./burn/burn.test";
import { clearingByPartitionTests } from "./clearingByPartition/clearingByPartition.test";
import { allowanceTests } from "./allowance/allowance.test";
import { controllerTests } from "./controller/controller.test";
import { holdTests } from "./hold/hold.test";
import { snapshotsTests } from "./snapshots/snapshots.test";
import { controllerByPartitionTests } from "./controllerByPartition/controllerByPartition.test";
import { securityHoldersAtSnapshotTests } from "./securityHoldersAtSnapshot/securityHoldersAtSnapshot.test";

// ── W3: Cap / batch suites ──────────────────────────────────────────────
import { capTests } from "./cap/cap.test";
import { capByPartitionTests } from "./capByPartition/capByPartition.test";
import { batchMintTests } from "./batchMint/batchMint.test";
import { batchBurnTests } from "./batchBurn/batchBurn.test";
import { batchControllerTests } from "./batchController/batchController.test";
import { mintTests } from "./mint/mint.test";
import { mintByPartitionTests } from "./mintByPartition/mintByPartition.test";
import { burnByPartitionTests } from "./burnByPartition/burnByPartition.test";
import { lockByPartitionTests } from "./lockByPartition/lockByPartition.test";
import { batchFreezeTests } from "./batchFreeze/batchFreeze.test";

describe("ATS — IAsset Suites", () => {
  let ctx: Awaited<ReturnType<typeof deployAssetMockCtx>>;

  beforeEach(async () => {
    ctx = await loadFixture(deployAssetMockCtx);
  });

  // ── W1: Generic single-partition suites ──────────────────────────────
  accessControlTests(() => ctx);
  adjustBalancesFacetTests(() => ctx);
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
  pauseTests(() => ctx);

  // ── W1: Layer 1 suites ────────────────────────────────────────────
  corporateActionsTests(() => ctx);
  dividendSecurityHoldersTests(() => ctx);
  documentationTests(() => ctx);
  scheduledBalanceAdjustmentsTests(() => ctx);
  freezeAtSnapshotTests(() => ctx);
  freezeAtSnapshotByPartitionTests(() => ctx);
  securityHoldersTests(() => ctx);
  votingTests(() => ctx);

  // ── W2: Multi-partition suites ──────────────────────────────────────
  holdAtSnapshotTests(() => ctx);
  lockAtSnapshotTests(() => ctx);
  lockAtSnapshotByPartitionTests(() => ctx);
  balanceTrackerAdjustedTests(() => ctx);
  balanceTrackerAtSnapshotByPartitionTests(() => ctx);
  balanceTrackerAtSnapshotTests(() => ctx);
  snapshotsByPartitionTests(() => ctx);
  votingSecurityHoldersTests(() => ctx);
  transferAndLockByPartitionTests(() => ctx);

  // ── W2: New suites ─────────────────────────────────────────────────
  allowanceTests(() => ctx);
  controllerTests(() => ctx);
  controllerByPartitionTests(() => ctx);
  holdTests(() => ctx);
  snapshotsTests(() => ctx);
  securityHoldersAtSnapshotTests(() => ctx);

  // ── W2: layer_1 suites ─────────────────────────────────────────────
  lockTests(() => ctx);
  partitionsTests(() => ctx);
  transferAndLockTests(() => ctx);
  erc20PermitTests(() => ctx);
  externalControlListTests(() => ctx);
  externalKycListTests(() => ctx);
  externalPauseTests(() => ctx);
  externalListSizeCapTests(() => ctx);

  // ── W3: Cap / batch suites ─────────────────────────────────────────────
  capTests(() => ctx);
  capByPartitionTests(() => ctx);
  batchMintTests(() => ctx);
  batchBurnTests(() => ctx);
  batchControllerTests(() => ctx);

  // ── W3: Mint / burn suites ────────────────────────────────────────────
  mintTests(() => ctx);
  mintByPartitionTests(() => ctx);
  burnByPartitionTests(() => ctx);

  // ── W3: Lock / freeze suites ──────────────────────────────────────────
  lockByPartitionTests(() => ctx);
  batchFreezeTests(() => ctx);

  // ── W4: Clearing / balance / batch suites ─────────────────────────────
  clearingAtSnapshotTests(() => ctx);
  balanceTrackerTests(() => ctx);
  batchTransferTests(() => ctx);

  // ── W4: Transfer / burn suites ────────────────────────────────────────
  transferTests(() => ctx);
  transferByPartitionTests(() => ctx);
  burnTests(() => ctx);

  // ── W4: Clearing-by-partition suite ───────────────────────────────────
  clearingByPartitionTests(() => ctx);
});
