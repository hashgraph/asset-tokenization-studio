// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "./IBondTypes.sol";
import { IBondManagement } from "./IBondManagement.sol";
import { IBondRead } from "./IBondRead.sol";

/// @title IBond — off-chain umbrella for the Bond domain
/// @notice Aggregates IBondManagement + IBondRead into a single TypeChain-friendly handle
///         for tests and SDK consumers.
/// @dev DO NOT inherit this interface from any facet contract. Each facet must `is` exactly
///      its per-facet interface (`IBondManagement` or `IBondRead`). This umbrella contains
///      no function declarations of its own.
interface IBond is IBondTypes, IBondManagement, IBondRead {
    /**
     * @notice Emitted when a coupon is cancelled.
     * @param couponId Identifier of the cancelled coupon.
     * @param operator Address that performed the cancellation.
     */
    event CouponCancelled(uint256 couponId, address indexed operator);

    /**
     * @notice Coupon execution failed because the coupon has already been executed or cancelled.
     */
    error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId);
}
