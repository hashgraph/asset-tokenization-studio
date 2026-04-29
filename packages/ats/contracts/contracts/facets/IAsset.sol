// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Layer 1 — Core
import {
    IScheduledCrossOrderedTasks
} from "./layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { IAccessControl } from "./accessControl/IAccessControl.sol";
import { IAdjustBalances } from "./layer_2/adjustBalance/IAdjustBalances.sol";
import { IAmortization } from "./layer_2/amortization/IAmortization.sol";
import { IBond } from "./layer_2/bond/IBond.sol";
import { IBondUSA } from "./layer_3/bondUSA/IBondUSA.sol";

// Layer 1 — ERC1400

// Layer 1 — ERC3643
import { ICorporateActions } from "./corporateActions/ICorporateActions.sol";
import { IDiamond } from "../infrastructure/proxy/IDiamond.sol";

// Core
import { ICore } from "./core/ICore.sol";
import { ICoreAdjusted } from "./coreAdjusted/ICoreAdjusted.sol";

// Allowance
import { IAllowance } from "./allowance/IAllowance.sol";

// Layer 1 — External lists
import { IERC1410 } from "./layer_1/ERC1400/ERC1410/IERC1410.sol";
import { ITransfer } from "./transfer/ITransfer.sol";

// Layer 1 — Remaining facets
import { IERC20Votes } from "./layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { IERC3643 } from "./layer_1/ERC3643/IERC3643.sol";
import { IEquity } from "./layer_2/equity/IEquity.sol";
import { IEquityUSA } from "./layer_3/equityUSA/IEquityUSA.sol";
import { IExternalControlList } from "./layer_1/externalControlList/IExternalControlList.sol";
import { IExternalControlListManagement } from "./externalControlListManagement/IExternalControlListManagement.sol";
import { IExternalKycList } from "./layer_1/externalKycList/IExternalKycList.sol";
import { IExternalKycListManagement } from "./externalKycListManagement/IExternalKycListManagement.sol";
import { IExternalPauseManagement } from "./externalPauseManagement/IExternalPauseManagement.sol";
import { IFixedRate } from "./layer_2/interestRate/fixedRate/IFixedRate.sol";

// Layer 2
import { IHold } from "./layer_1/hold/IHold.sol";
import { IHoldByPartition } from "./holdByPartition/IHoldByPartition.sol";
import { IKyc } from "./layer_1/kyc/IKyc.sol";
// IKpiLinkedRate and ISustainabilityPerformanceTargetRate are excluded: both define
// getInterestRate() with incompatible return types (different InterestRate structs),
// which cannot be reconciled in a single Solidity interface. Use those typed instances
// directly when testing KPI-linked or SPTR interest rate facets.
import { ILoan } from "./layer_2/loan/ILoan.sol";
import { INominalValue } from "./layer_2/nominalValue/INominalValue.sol";
import { IPause } from "./pause/IPause.sol";
import { ILoansPortfolio } from "./layer_2/loansPortfolio/ILoansPortfolio.sol";
import { IVoting } from "./layer_2/voting/IVoting.sol";

// Layer 3
import { ISecurity } from "./layer_2/security/ISecurity.sol";
import { ISsiManagement } from "./ssiManagement/ISsiManagement.sol";
import { ITimeTravel } from "../test/testTimeTravel/ITimeTravel.sol";
import { IBalanceTracker } from "./balanceTracker/IBalanceTracker.sol";
import { IBalanceTrackerAdjusted } from "./balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol";
import { ITransferAndLock } from "./layer_3/transferAndLock/ITransferAndLock.sol";
import { ICoupon } from "./layer_2/coupon/ICoupon.sol";
import { IDividend } from "./layer_2/dividend/IDividend.sol";
import { IKpis } from "./layer_2/kpi/kpiLatest/IKpis.sol";
import { IProtectedPartitions } from "./layer_1/protectedPartition/IProtectedPartitions.sol";
import { IProceedRecipients } from "./layer_2/proceedRecipient/IProceedRecipients.sol";
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
import { ICouponListing } from "./couponListing/ICouponListing.sol";
import {
    IScheduledBalanceAdjustments
} from "./layer_2/scheduledTask/scheduledBalanceAdjustment/IScheduledBalanceAdjustments.sol";
import { ILock } from "./layer_1/lock/ILock.sol";
import { IFreeze } from "./freeze/IFreeze.sol";
import { IBatchFreeze } from "./batchFreeze/IBatchFreeze.sol";
import { ISnapshots } from "./layer_1/snapshot/ISnapshots.sol";
import { ICoreAtSnapshot } from "./coreAtSnapshot/ICoreAtSnapshot.sol";
import { IClearingTransfer } from "./layer_1/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "./layer_1/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "./layer_1/clearing/IClearingHoldCreation.sol";
import {
    IOperatorClearingHoldByPartition
} from "./layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol";
import { IClearing } from "./clearing/IClearing.sol";
import { IComplianceFacet } from "./compliance/IComplianceFacet.sol";
import { IMint } from "./mint/IMint.sol";
import { IMintByPartition } from "./mintByPartition/IMintByPartition.sol";
import { IBurnByPartition } from "./burnByPartition/IBurnByPartition.sol";
import { IClearingByPartition } from "./clearingByPartition/IClearingByPartition.sol";
import { IClearingHoldByPartition } from "./clearingHoldByPartition/IClearingHoldByPartition.sol";
import { IHoldFacet } from "./hold/IHoldFacet.sol";
import { IBatchController } from "./batchController/IBatchController.sol";
import { IBurn } from "./burn/IBurn.sol";
import { IDocumentation } from "./documentation/IDocumentation.sol";
import { IController } from "./controller/IController.sol";
import { IControllerHoldByPartition } from "./controllerHoldByPartition/IControllerHoldByPartition.sol";
import { IControllerByPartition } from "./controllerByPartition/IControllerByPartition.sol";
import { IProtectedHoldByPartition } from "./protectedHoldByPartition/IProtectedHoldByPartition.sol";
import { IERC20Permit } from "./layer_1/ERC1400/ERC20Permit/IERC20Permit.sol";
import { IControlList } from "./controlList/IControlList.sol";
import { IBatchBurn } from "./batchBurn/IBatchBurn.sol";
import { IBatchMint } from "./batchMint/IBatchMint.sol";
import { IBatchTransfer } from "./batchTransfer/IBatchTransfer.sol";

// solhint-disable no-empty-blocks
/**
 * @title IAsset
 * @author Asset Tokenization Studio Team
 * @notice Aggregated interface exposing every facet selector of the ATS Diamond through a single
 *         typed handle.
 * @dev Intended for use in tests and external tooling to interact with all Diamond methods
 *      through a single typed object, rather than multiple per-facet instances.
 *
 *      Note: IHold already transitively includes IAccessControl, IERC1410,
 *      IHoldRead, IHoldManagement, and IHoldTokenHolder. IERC3643 already includes its
 *      sub-interfaces. IERC20Votes includes IERC5805 and IVotes. Solidity C3 linearisation
 *      handles the resulting diamond inheritance without conflicts.
 *
 *      Note: IKpiLinkedRate and ISustainabilityPerformanceTargetRate are intentionally excluded
 *      due to an irreconcilable function selector conflict on getInterestRate(). Consumers that
 *      need the KPI-linked or SPTR surface must use those typed interfaces directly.
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
    IHold,
    ITransfer,
    IERC20Votes,
    IERC1410,
    IERC3643,
    IBurn,
    IScheduledCrossOrderedTasks,
    IBond,
    IEquity,
    ISecurity,
    ICorporateActions,
    IProtectedPartitions,
    IProceedRecipients,
    INominalValue,
    IAmortization,
    ILoan,
    IAdjustBalances,
    ILoansPortfolio,
    IVoting,
    IBondUSA,
    IEquityUSA,
    ITransferAndLock,
    // Corporate Actions
    ICoupon,
    IDividend,
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
    IFixedRate,
    // Scheduled Tasks
    ICouponListing,
    IScheduledBalanceAdjustments,
    ILock,
    IFreeze,
    IBatchFreeze,
    ISnapshots,
    ICoreAtSnapshot,
    // Clearing interfaces
    IClearing,
    IClearingTransfer,
    IClearingRedeem,
    IClearingHoldCreation,
    IOperatorClearingHoldByPartition,
    IClearingByPartition,
    IClearingHoldByPartition,
    // Additional ERC
    IComplianceFacet,
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
    IProtectedHoldByPartition,
    IERC20Permit,
    // Control
    IControlList,
    IExternalControlList,
    IExternalControlListManagement,
    IBatchBurn,
    IBatchMint,
    IBatchTransfer
{}
