// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Layer 1 — Core
import { IScheduledCrossOrderedTasks } from "./scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { IAccessControl } from "./accessControl/IAccessControl.sol";
import { IAdjustBalances } from "./adjustBalances/IAdjustBalances.sol";
import { IAmortization } from "./amortization/IAmortization.sol";
import { IMaturity } from "./maturity/IMaturity.sol";
import { IPrincipal } from "./principal/IPrincipal.sol";

// Layer 1 — ERC1400

// Layer 1 — ERC3643
import { IRecovery } from "./recovery/IRecovery.sol";
import { ICorporateActions } from "./corporateActions/ICorporateActions.sol";
import { IDiamond } from "../infrastructure/proxy/IDiamond.sol";

// Core
import { ICore } from "./core/ICore.sol";
import { ICoreAdjusted } from "./coreAdjusted/ICoreAdjusted.sol";

// Allowance
import { IAllowance } from "./allowance/IAllowance.sol";

// Layer 1 — External lists
import { ITransferByPartition } from "./transferByPartition/ITransferByPartition.sol";

import { IOperator } from "./operator/IOperator.sol";
import { ITransfer } from "./transfer/ITransfer.sol";

// Layer 1 — Remaining facets
import { IERC20Votes } from "./erc20Votes/IERC20Votes.sol";
import { IExternalControlList } from "./externalControlListManagement/IExternalControlList.sol";
import { IExternalControlListManagement } from "./externalControlListManagement/IExternalControlListManagement.sol";
import { IExternalKycList } from "./externalKycListManagement/IExternalKycList.sol";
import { IExternalKycListManagement } from "./externalKycListManagement/IExternalKycListManagement.sol";
import { IExternalPauseManagement } from "./externalPauseManagement/IExternalPauseManagement.sol";
import { IFixedRate } from "./fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "./kpiLinkedRate/IKpiLinkedRate.sol";

// Layer 2
import { IOperatorHoldByPartition } from "./operatorHoldByPartition/IOperatorHoldByPartition.sol";
import { IHoldByPartition } from "./holdByPartition/IHoldByPartition.sol";
import { IKyc } from "./kyc/IKyc.sol";
// IKpiLinkedRate is excluded: it defines getInterestRate() with an incompatible return type
// (different InterestRate struct), which cannot be reconciled in a single Solidity interface.
// Use the typed instance directly when testing KPI-linked rate facets.
import { ILoan } from "./loan/ILoan.sol";
import { INominalValue } from "./nominalValue/INominalValue.sol";
import { INominalValueAtSnapshot } from "./nominalValueAtSnapshot/INominalValueAtSnapshot.sol";
import { IPause } from "./pause/IPause.sol";
import { ILoansPortfolio } from "./loansPortfolio/ILoansPortfolio.sol";
import { IVoting } from "./voting/IVoting.sol";
import { IVotingSecurityHolders } from "./votingSecurityHolders/IVotingSecurityHolders.sol";

// Layer 3
import { ISsiManagement } from "./ssiManagement/ISsiManagement.sol";
import { ITimeTravel } from "../test/testTimeTravel/ITimeTravel.sol";
import { IBalanceTracker } from "./balanceTracker/IBalanceTracker.sol";
import { IBalanceTrackerAdjusted } from "./balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol";
import { ITransferAndLock } from "./transferAndLock/ITransferAndLock.sol";
import { ITransferAndLockByPartition } from "./transferAndLockByPartition/ITransferAndLockByPartition.sol";
import { ICoupon } from "./coupon/ICoupon.sol";
import { IDividend } from "./dividend/IDividend.sol";
import { IDividendSecurityHolders } from "./dividendSecurityHolders/IDividendSecurityHolders.sol";
import { IKpis } from "./kpis/IKpis.sol";
import { IProtectedPartitions } from "./protectedPartitions/IProtectedPartitions.sol";
import { IProceedRecipients } from "./proceedRecipients/IProceedRecipients.sol";
import { ICap } from "./cap/ICap.sol";
import { ICapByPartition } from "./capByPartition/ICapByPartition.sol";
import { INonces } from "./nonces/INonces.sol";
import { IBalanceTrackerByPartition } from "./balanceTrackerByPartition/IBalanceTrackerByPartition.sol";
import { IBalanceTrackerAtSnapshot } from "./balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol";
import {
    IBalanceTrackerAtSnapshotByPartition
} from "./balanceTrackerAtSnapshotByPartition/IBalanceTrackerAtSnapshotByPartition.sol";
import { IClearingAtSnapshot } from "./clearingAtSnapshot/IClearingAtSnapshot.sol";
import { IClearingAtSnapshotByPartition } from "./clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol";
import { IHoldAtSnapshotByPartition } from "./holdAtSnapshotByPartition/IHoldAtSnapshotByPartition.sol";
import { IHoldAtSnapshot } from "./holdAtSnapshot/IHoldAtSnapshot.sol";
import { ILockAtSnapshotByPartition } from "./lockAtSnapshotByPartition/ILockAtSnapshotByPartition.sol";
import { ILockAtSnapshot } from "./lockAtSnapshot/ILockAtSnapshot.sol";
import { IMaturityByPartition } from "./maturityByPartition/IMaturityByPartition.sol";
import { ICouponListing } from "./couponListing/ICouponListing.sol";
import { IScheduledBalanceAdjustment } from "./scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import { ICouponSecurityHolders } from "./couponSecurityHolders/ICouponSecurityHolders.sol";
import { ISecurityHolders } from "./securityHolders/ISecurityHolders.sol";

import { ILock } from "./lock/ILock.sol";
import { ILockByPartition } from "./lockByPartition/ILockByPartition.sol";
import { IFreeze } from "./freeze/IFreeze.sol";
import { IBatchFreeze } from "./batchFreeze/IBatchFreeze.sol";
import { ISnapshots } from "./snapshots/ISnapshots.sol";
import { ISnapshotsByPartition } from "./snapshotsByPartition/ISnapshotsByPartition.sol";
import { ISecurityHoldersAtSnapshot } from "./securityHoldersAtSnapshot/ISecurityHoldersAtSnapshot.sol";
import { IFreezeAtSnapshot } from "./freezeAtSnapshot/IFreezeAtSnapshot.sol";
import { IFreezeAtSnapshotByPartition } from "./freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol";
import { IIdentity } from "./identity/IIdentity.sol";
import { IPartitions } from "./partitions/IPartitions.sol";
import { ICoreAtSnapshot } from "./coreAtSnapshot/ICoreAtSnapshot.sol";
import { IOperatorClearingByPartition } from "./operatorClearingByPartition/IOperatorClearingByPartition.sol";
import {
    IProtectedClearingHoldByPartition
} from "./protectedClearingHoldByPartition/IProtectedClearingHoldByPartition.sol";
import {
    IOperatorClearingHoldByPartition
} from "./operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol";
import { IClearing } from "./clearing/IClearing.sol";
import { IComplianceFacet } from "./compliance/IComplianceFacet.sol";
import { IComplianceByPartition } from "./complianceByPartition/IComplianceByPartition.sol";
import { IMint } from "./mint/IMint.sol";
import { IMintByPartition } from "./mintByPartition/IMintByPartition.sol";
import { IBurnByPartition } from "./burnByPartition/IBurnByPartition.sol";
import { IClearingByPartition } from "./clearingByPartition/IClearingByPartition.sol";
import { IClearingHoldByPartition } from "./clearingHoldByPartition/IClearingHoldByPartition.sol";
import { IProtectedClearingByPartition } from "./protectedClearingByPartition/IProtectedClearingByPartition.sol";
import { IHoldFacet } from "./hold/IHoldFacet.sol";
import { IBatchController } from "./batchController/IBatchController.sol";
import { IBurn } from "./burn/IBurn.sol";
import { IDocumentation } from "./documentation/IDocumentation.sol";
import { IController } from "./controller/IController.sol";
import { IControllerHoldByPartition } from "./controllerHoldByPartition/IControllerHoldByPartition.sol";
import { IControllerByPartition } from "./controllerByPartition/IControllerByPartition.sol";
import { IProtectedByPartition } from "./protectedByPartition/IProtectedByPartition.sol";
import { IProtectedHoldByPartition } from "./protectedHoldByPartition/IProtectedHoldByPartition.sol";
import { IERC20Permit } from "./erc20Permit/IERC20Permit.sol";
import { IEIP712 } from "./eip712/IEIP712.sol";
import { IControlList } from "./controlList/IControlList.sol";
import { IBatchBurn } from "./batchBurn/IBatchBurn.sol";
import { IBatchMint } from "./batchMint/IBatchMint.sol";
import { IBatchTransfer } from "./batchTransfer/IBatchTransfer.sol";
import { ICustomData } from "./customData/ICustomData.sol";
import { IDeactivate } from "./deactivate/IDeactivate.sol";
import { IOperatorByPartition } from "./operatorByPartition/IOperatorByPartition.sol";
import { IInterestRate } from "./interestRate/IInterestRate.sol";
import { IInitializer } from "./initializer/IInitializer.sol";

/// @custom:hash resolverKey TransferAndLock
bytes32 constant RESOLVER_KEY_TRANSFER_AND_LOCK = 0xe92a301947f21b973cb1007aeba48f2eecd916d05107b6355fc499b783b8f7d9;

/// @custom:hash resolverKey TransferAndLockKpiLinkedRate
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_TRANSFER_AND_LOCK_KPI_LINKED_RATE = 0x2fbe9c91ad821641ca83a65f6399878b8419fd717379cd1abfac68f2c82940dd;

/// @custom:hash resolverKey TransferAndLockFixedRate
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_TRANSFER_AND_LOCK_FIXED_RATE = 0x0405063ec31286ce4abbe4db662da098f2cbd15f96d745680e850bd60181eae2;

/**
 * @title IAsset
 * @author Asset Tokenization Studio Team
 * @notice Aggregated interface exposing every facet selector of the ATS Diamond through a single
 *         typed handle.
 * @dev Intended for use in tests and external tooling to interact with all Diamond methods
 *      through a single typed object, rather than multiple per-facet instances.
 *
 *      Note: IHold already transitively includes IAccessControl,
 *      IHoldRead, and IHoldTokenHolder. IERC3643 surfaces the shared ERC-3643 types,
 *      events and errors (IERC3643Types). IERC20Votes includes IERC5805 and IVotes.
 *      Solidity C3 linearisation handles the resulting diamond inheritance without conflicts.
 *
 *      Note: IKpiLinkedRate is intentionally excluded due to an irreconcilable function selector
 *      conflict on getInterestRate(). Consumers that need the KPI-linked rate surface must use
 *      that typed interface directly.
 */
interface IAsset is
    ICore,
    ICoreAdjusted,
    IAllowance,
    IAccessControl,
    IPause,
    IExternalPauseManagement,
    ISsiManagement,
    IKyc,
    IExternalKycList,
    IExternalKycListManagement,
    IKpis,
    ITimeTravel,
    IDiamond,
    IOperatorHoldByPartition,
    ITransfer,
    IERC20Votes,
    ITransferByPartition,
    IOperator,
    IRecovery,
    IBurn,
    IScheduledCrossOrderedTasks,
    IPrincipal,
    IMaturity,
    ICorporateActions,
    IProtectedPartitions,
    IProceedRecipients,
    INominalValue,
    INominalValueAtSnapshot,
    IAmortization,
    ILoan,
    IAdjustBalances,
    IScheduledBalanceAdjustment,
    ILoansPortfolio,
    IVoting,
    IVotingSecurityHolders,
    ITransferAndLock,
    ITransferAndLockByPartition,
    // Corporate Actions
    ICoupon,
    ICouponSecurityHolders,
    IDividend,
    IDividendSecurityHolders,
    // Additional Layer 1
    IBalanceTracker,
    IBalanceTrackerAdjusted,
    ICap,
    ICapByPartition,
    INonces,
    IBalanceTrackerByPartition,
    IBalanceTrackerAtSnapshot,
    IBalanceTrackerAtSnapshotByPartition,
    IClearingAtSnapshot,
    IClearingAtSnapshotByPartition,
    IHoldAtSnapshotByPartition,
    IHoldAtSnapshot,
    ILockAtSnapshotByPartition,
    ILockAtSnapshot,
    IMaturityByPartition,
    IKpiLinkedRate,
    IFixedRate,
    // Scheduled Tasks
    ICouponListing,
    ILock,
    ILockByPartition,
    IFreeze,
    IBatchFreeze,
    ISnapshots,
    ISnapshotsByPartition,
    ISecurityHoldersAtSnapshot,
    IFreezeAtSnapshot,
    IIdentity,
    IPartitions,
    IFreezeAtSnapshotByPartition,
    ICoreAtSnapshot,
    // Clearing interfaces
    IClearing,
    IOperatorClearingByPartition,
    IProtectedClearingHoldByPartition,
    IOperatorClearingHoldByPartition,
    IClearingByPartition,
    IClearingHoldByPartition,
    IProtectedClearingByPartition,
    // Additional ERC
    IComplianceFacet,
    IComplianceByPartition,
    IHoldFacet,
    IBatchController,
    IHoldByPartition,
    IMint,
    IMintByPartition,
    IBurnByPartition,
    IDocumentation,
    IController,
    IControllerHoldByPartition,
    IControllerByPartition,
    IProtectedByPartition,
    IProtectedHoldByPartition,
    IERC20Permit,
    IEIP712,
    // Control
    IControlList,
    IExternalControlList,
    IExternalControlListManagement,
    IBatchBurn,
    IBatchMint,
    IBatchTransfer,
    ICustomData,
    IDeactivate,
    IOperatorByPartition,
    ISecurityHolders,
    IInterestRate,
    IInitializer
{}
