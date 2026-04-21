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

// Layer 1 — External lists
import { IERC1410 } from "./layer_1/ERC1400/ERC1410/IERC1410.sol";
import { IERC20 } from "./layer_1/ERC1400/ERC20/IERC20.sol";

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
import { ITransferAndLock } from "./layer_3/transferAndLock/ITransferAndLock.sol";
import { ICoupon } from "./layer_2/coupon/ICoupon.sol";
import { IDividend } from "./layer_2/dividend/IDividend.sol";

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
    IERC20,
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
    IERC1594,
    IERC1643,
    IERC1644,
    IERC20Permit,
    // Control
    IControlList,
    IExternalControlList,
    IExternalControlListManagement
{}
