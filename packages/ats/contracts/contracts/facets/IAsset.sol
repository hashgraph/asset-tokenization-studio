// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Layer 1 — Core
import {
    IScheduledCrossOrderedTasks
} from "./layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { IAccessControl } from "./layer_1/accessControl/IAccessControl.sol";
import { IAdjustBalances } from "./layer_2/adjustBalance/IAdjustBalances.sol";
import { IAmortization } from "./layer_2/amortization/IAmortization.sol";
import { IBond } from "./layer_2/bond/IBond.sol";
import { IBondUSA } from "./layer_3/bondUSA/IBondUSA.sol";

// Layer 1 — ERC1400

// Layer 1 — ERC3643
import { ICorporateActions } from "./layer_1/corporateAction/ICorporateActions.sol";
import { IDiamond } from "../infrastructure/proxy/IDiamond.sol";
import { ICommonErrors } from "../infrastructure/errors/ICommonErrors.sol";

// Core
import { ICore } from "./core/ICore.sol";
import { ICoreAdjusted } from "./coreAdjusted/ICoreAdjusted.sol";

// Allowance
import { IAllowance } from "./allowance/IAllowance.sol";

// Layer 1 — External lists
import { IERC1410 } from "./layer_1/ERC1400/ERC1410/IERC1410.sol";
import { ITransferFacet } from "./transfer/ITransferFacet.sol";

// Layer 1 — Remaining facets
import { IERC20Votes } from "./layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { IERC3643 } from "./layer_1/ERC3643/IERC3643.sol";
import { IEquity } from "./layer_2/equity/IEquity.sol";
import { IEquityUSA } from "./layer_3/equityUSA/IEquityUSA.sol";
import { IExternalControlList } from "./layer_1/externalControlList/IExternalControlList.sol";
import { IExternalControlListManagement } from "./layer_1/externalControlList/IExternalControlListManagement.sol";
import { IExternalKycList } from "./layer_1/externalKycList/IExternalKycList.sol";
import { IExternalKycListManagement } from "./layer_1/externalKycList/IExternalKycListManagement.sol";
import { IExternalPause } from "./layer_1/externalPause/IExternalPause.sol";
import { IExternalPauseManagement } from "./layer_1/externalPause/IExternalPauseManagement.sol";
import { IFixedRate } from "./layer_2/interestRate/fixedRate/IFixedRate.sol";
import { IKpiLinkedRateErrors } from "./layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol";
import {
    ISustainabilityPerformanceTargetRateTypes
} from "./layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRateTypes.sol";

// Layer 2
import { IHold } from "./layer_1/hold/IHold.sol";
import { IKyc } from "./layer_1/kyc/IKyc.sol";
// IKpiLinkedRate and ISustainabilityPerformanceTargetRate are excluded: both define
// getInterestRate() with incompatible return types (different InterestRate structs),
// which cannot be reconciled in a single Solidity interface. Use those typed instances
// directly when testing KPI-linked or SPTR interest rate facets.
import { ILoan } from "./layer_2/loan/ILoan.sol";
import { INominalValue } from "./layer_2/nominalValue/INominalValue.sol";
import { IPause } from "./layer_1/pause/IPause.sol";
import { ILoansPortfolio } from "./layer_2/loansPortfolio/ILoansPortfolio.sol";
import { IVoting } from "./layer_2/voting/IVoting.sol";

// Layer 3
import { ISecurity } from "./layer_2/security/ISecurity.sol";
import { ISsiManagement } from "./layer_1/ssi/ISsiManagement.sol";
import { ITimeTravel } from "../test/testTimeTravel/ITimeTravel.sol";
import { IBalanceTracker } from "./balanceTracker/IBalanceTracker.sol";
import { ITransferAndLock } from "./layer_3/transferAndLock/ITransferAndLock.sol";
import { ICoupon } from "./layer_2/coupon/ICoupon.sol";
import { IDividend } from "./layer_2/dividend/IDividend.sol";
import { IKpis } from "./layer_2/kpi/kpiLatest/IKpis.sol";
import { IScheduledSnapshots } from "./layer_2/scheduledTask/scheduledSnapshot/IScheduledSnapshots.sol";
import { IProtectedPartitions } from "./layer_1/protectedPartition/IProtectedPartitions.sol";
import { IProceedRecipients } from "./layer_2/proceedRecipient/IProceedRecipients.sol";
import { ICap } from "./layer_1/cap/ICap.sol";
import { INonces } from "./layer_1/nonce/INonces.sol";
import { ITotalBalance } from "./layer_1/totalBalance/ITotalBalance.sol";
import { IScheduledCouponListing } from "./layer_2/scheduledTask/scheduledCouponListing/IScheduledCouponListing.sol";
import {
    IScheduledBalanceAdjustments
} from "./layer_2/scheduledTask/scheduledBalanceAdjustment/IScheduledBalanceAdjustments.sol";
import { ILock } from "./layer_1/lock/ILock.sol";
import { IFreeze } from "./layer_1/freeze/IFreeze.sol";
import { ISnapshots } from "./layer_1/snapshot/ISnapshots.sol";
import { IClearingActions } from "./layer_1/clearing/IClearingActions.sol";
import { IClearingTransfer } from "./layer_1/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "./layer_1/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "./layer_1/clearing/IClearingHoldCreation.sol";
import { IClearingRead } from "./layer_1/clearing/IClearingRead.sol";
import { IComplianceFacet } from "./compliance/IComplianceFacet.sol";
import { IHoldFacet } from "./hold/IHoldFacet.sol";
import { IERC1594 } from "./layer_1/ERC1400/ERC1594/IERC1594.sol";
import { IDocumentation } from "./documentation/IDocumentation.sol";
import { IERC1644 } from "./layer_1/ERC1400/ERC1644/IERC1644.sol";
import { IERC20Permit } from "./layer_1/ERC1400/ERC20Permit/IERC20Permit.sol";
import { IControlList } from "./layer_1/controlList/IControlList.sol";

/**
 * @title IAsset
 * @dev Unified interface combining all facet interfaces of the ATS Diamond.
 * Intended for use in tests and external tooling to interact with all Diamond
 * methods through a single typed object, rather than multiple per-facet instances.
 *
 * Note: IHold already transitively includes IAccessControl, IClearing, IERC1410,
 * IHoldRead, IHoldManagement, and IHoldTokenHolder. IERC3643 already includes its
 * sub-interfaces. IERC20Votes includes IERC5805 and IVotes. Solidity C3 linearization
 * handles the resulting diamond inheritance without conflicts.
 *
 * Note: IKpiLinkedRate and ISustainabilityPerformanceTargetRate are intentionally
 * excluded due to an irreconcilable function selector conflict on getInterestRate().
 * However, IKpiLinkedRateErrors and ISustainabilityPerformanceTargetRateErrors are included
 * to expose the error selectors through IAsset.
 */
// solhint-disable no-empty-blocks
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
    ITransferFacet,
    IERC20Votes,
    IERC1410,
    IERC3643,
    IScheduledCrossOrderedTasks,
    IScheduledSnapshots,
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
    ICap,
    INonces,
    ITotalBalance,
    IFixedRate,
    // Scheduled Tasks
    IScheduledCouponListing,
    IScheduledBalanceAdjustments,
    ILock,
    IFreeze,
    ISnapshots,
    // Clearing interfaces
    IClearingActions,
    IClearingTransfer,
    IClearingRedeem,
    IClearingHoldCreation,
    IClearingRead,
    // Additional ERC
    IComplianceFacet,
    IHoldFacet,
    IERC1594,
    IDocumentation,
    IERC1644,
    IERC20Permit,
    // Control
    IControlList,
    IExternalControlList,
    IExternalControlListManagement
{}
