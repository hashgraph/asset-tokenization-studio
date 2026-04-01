// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Layer 1 — Core
import { IAccessControl } from "./layer_1/accessControl/IAccessControl.sol";
import { ICap } from "./layer_1/cap/ICap.sol";
import { IClearingActions } from "./layer_1/clearing/IClearingActions.sol";
import { IClearingHoldCreation } from "./layer_1/clearing/IClearingHoldCreation.sol";
import { IClearingRead } from "./layer_1/clearing/IClearingRead.sol";
import { IClearingRedeem } from "./layer_1/clearing/IClearingRedeem.sol";
import { IClearingTransfer } from "./layer_1/clearing/IClearingTransfer.sol";
import { IControlList } from "./layer_1/controlList/IControlList.sol";
import { ICorporateActions } from "./layer_1/corporateAction/ICorporateActions.sol";

// Layer 1 — ERC1400
import { IERC1410 } from "./layer_1/ERC1400/ERC1410/IERC1410.sol";
import { IERC1594 } from "./layer_1/ERC1400/ERC1594/IERC1594.sol";
import { IERC1643 } from "./layer_1/ERC1400/ERC1643/IERC1643.sol";
import { IERC1644 } from "./layer_1/ERC1400/ERC1644/IERC1644.sol";
import { IERC20 } from "./layer_1/ERC1400/ERC20/IERC20.sol";
import { IERC20Permit } from "./layer_1/ERC1400/ERC20Permit/IERC20Permit.sol";
import { IERC20Votes } from "./layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";

// Layer 1 — ERC3643
import { IERC3643 } from "./layer_1/ERC3643/IERC3643.sol";
import { ICompliance } from "./layer_1/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "./layer_1/ERC3643/IIdentityRegistry.sol";

// Layer 1 — External lists
import { IExternalControlList } from "./layer_1/externalControlList/IExternalControlList.sol";
import { IExternalControlListManagement } from "./layer_1/externalControlList/IExternalControlListManagement.sol";
import { IExternalKycList } from "./layer_1/externalKycList/IExternalKycList.sol";
import { IExternalKycListManagement } from "./layer_1/externalKycList/IExternalKycListManagement.sol";
import { IExternalPause } from "./layer_1/externalPause/IExternalPause.sol";
import { IExternalPauseManagement } from "./layer_1/externalPause/IExternalPauseManagement.sol";

// Layer 1 — Remaining facets
import { IFreeze } from "./layer_1/freeze/IFreeze.sol";
import { IHold } from "./layer_1/hold/IHold.sol";
import { IKyc } from "./layer_1/kyc/IKyc.sol";
import { IRevocationList } from "./layer_1/kyc/IRevocationList.sol";
import { ILock } from "./layer_1/lock/ILock.sol";
import { INonces } from "./layer_1/nonce/INonces.sol";
import { IPause } from "./layer_1/pause/IPause.sol";
import { IProtectedPartitions } from "./layer_1/protectedPartition/IProtectedPartitions.sol";
import { ISnapshots } from "./layer_1/snapshot/ISnapshots.sol";
import { ISsiManagement } from "./layer_1/ssi/ISsiManagement.sol";
import { ITotalBalance } from "./layer_1/totalBalance/ITotalBalance.sol";

// Layer 2
import { IAdjustBalances } from "./layer_2/adjustBalance/IAdjustBalances.sol";
import { IBond } from "./layer_2/bond/IBond.sol";
import { IBondRead } from "./layer_2/bond/IBondRead.sol";
import { ICoupon } from "./layer_2/coupon/ICoupon.sol";
import { IEquity } from "./layer_2/equity/IEquity.sol";
import { IFixedRate } from "./layer_2/interestRate/fixedRate/IFixedRate.sol";
// IKpiLinkedRate and ISustainabilityPerformanceTargetRate are excluded: both define
// getInterestRate() with incompatible return types (different InterestRate structs),
// which cannot be reconciled in a single Solidity interface. Use those typed instances
// directly when testing KPI-linked or SPTR interest rate facets.
import { IKpis } from "./layer_2/kpi/kpiLatest/IKpis.sol";
import { INominalValue } from "./layer_2/nominalValue/INominalValue.sol";
import { IProceedRecipients } from "./layer_2/proceedRecipient/IProceedRecipients.sol";
import {
    IScheduledBalanceAdjustments
} from "./layer_2/scheduledTask/scheduledBalanceAdjustment/IScheduledBalanceAdjustments.sol";
import { IScheduledCouponListing } from "./layer_2/scheduledTask/scheduledCouponListing/IScheduledCouponListing.sol";
import {
    IScheduledCrossOrderedTasks
} from "./layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { IScheduledSnapshots } from "./layer_2/scheduledTask/scheduledSnapshot/IScheduledSnapshots.sol";
import { ISecurity } from "./layer_2/security/ISecurity.sol";
import { ILoan } from "./layer_2/loan/ILoan.sol";
import { IVoting } from "./layer_2/voting/IVoting.sol";

// Layer 3
import { IBondUSA } from "./layer_3/bondUSA/IBondUSA.sol";
import { IEquityUSA } from "./layer_3/equityUSA/IEquityUSA.sol";
import { ITransferAndLock } from "./layer_3/transferAndLock/ITransferAndLock.sol";
import { ITimeTravel } from "../test/testTimeTravel/ITimeTravel.sol";
import { IDiamond } from "../infrastructure/proxy/IDiamond.sol";
import { IArrayLib } from "../infrastructure/utils/IArrayLib.sol";
import { IExternalListManagement } from "../domain/core/externalList/IExternalListManagement.sol";
import { ICommon } from "../domain/ICommon.sol";
import { IScheduledTasksCommon } from "../domain/asset/scheduledTask/IScheduledTasksCommon.sol";
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
 */
// solhint-disable no-empty-blocks
interface IAsset is
    ICommon,
    IArrayLib,
    IScheduledTasksCommon,
    ITimeTravel,
    IExternalListManagement,
    IDiamond,
    IAccessControl,
    ICap,
    IClearingActions,
    IClearingHoldCreation,
    IClearingRead,
    IClearingRedeem,
    IClearingTransfer,
    IControlList,
    ICorporateActions,
    IERC1410,
    IERC1594,
    IERC1643,
    IERC1644,
    IERC20,
    IERC20Permit,
    IERC20Votes,
    IERC3643,
    IExternalControlListManagement,
    IExternalKycListManagement,
    IExternalPauseManagement,
    IFreeze,
    IHold,
    IKyc,
    ILock,
    INonces,
    IPause,
    IProtectedPartitions,
    ISnapshots,
    ISsiManagement,
    ITotalBalance,
    IAdjustBalances,
    IBond,
    IBondRead,
    ICoupon,
    IEquity,
    IFixedRate,
    IKpis,
    INominalValue,
    IProceedRecipients,
    IScheduledBalanceAdjustments,
    IScheduledCouponListing,
    IScheduledCrossOrderedTasks,
    IScheduledSnapshots,
    ISecurity,
    ILoan,
    IVoting,
    IBondUSA,
    IEquityUSA,
    ITransferAndLock,
    IDividend
{}
