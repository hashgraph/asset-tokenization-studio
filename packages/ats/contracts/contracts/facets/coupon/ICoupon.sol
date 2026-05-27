// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponTypes } from "./ICouponTypes.sol";

/// @custom:hash resolverKey Coupon
bytes32 constant RESOLVER_KEY_COUPON = 0xe292dde7a8154c59d06fe2333acc2b54d003262aadc39ee2c7b474e6e64add6b;

/**
 * @title ICoupon
 * @author Asset Tokenization Studio Team
 * @notice Writer-side interface for the Coupon domain — exposes the corporate-action lifecycle
 *         (`setCoupon`, `cancelCoupon`) plus the per-record reads that consumers need before
 *         executing or auditing a coupon.
 * @dev Inherits `ICouponTypes` for the shared struct/enum tier (`Coupon`, `RegisteredCoupon`,
 *      `CouponFor`, `CouponAmountFor`, `RateCalculationStatus`). Domain events and errors live
 *      on this writer interface (not on the shared types tier) so that read-only sibling
 *      facets such as `ICouponSecurityHolders` and `ICouponListing` do not pick up symbols
 *      they never emit or revert with — a narrow EIP-165 interfaceId is the goal. Aggregated
 *      into the off-chain `IAsset` umbrella alongside the read-only sibling facets.
 */
interface ICoupon is ICouponTypes {
    /**
     * @notice Emitted when an operator schedules a new coupon corporate action.
     * @param corporateActionId Identifier of the underlying corporate action.
     * @param couponId One-indexed coupon identifier within the coupon corporate action type.
     * @param operator Address that scheduled the coupon.
     * @param coupon The coupon parameters captured at scheduling time.
     */
    event CouponSet(
        bytes32 indexed corporateActionId,
        uint256 indexed couponId,
        address indexed operator,
        Coupon coupon
    );

    /**
     * @notice Emitted when an operator cancels a previously scheduled coupon.
     * @dev Cancellation is rejected once the execution date has passed; see
     *      `CouponAlreadyExecuted`.
     * @param couponId One-indexed identifier of the cancelled coupon.
     * @param operator Address that performed the cancellation.
     */
    event CouponCancelled(uint256 indexed couponId, address indexed operator);

    /**
     * @notice Emitted when an admin force-cancels a coupon, bypassing date guards.
     * @param couponId One-indexed identifier of the force-cancelled coupon.
     * @param operator Address that performed the force-cancellation.
     */
    event CouponForceCancelled(uint256 indexed couponId, address indexed operator);

    /**
     * @notice Reverts when an operator attempts to cancel a coupon whose execution date has
     *         already passed.
     * @param corporateActionId Identifier of the underlying corporate action.
     * @param couponId One-indexed identifier of the coupon that cannot be cancelled.
     */
    error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId);

    /**
     * @notice Reverts when the underlying corporate-action creation step returns the zero id,
     *         indicating the coupon could not be persisted.
     */
    error CouponCreationFailed();

    /**
     * @notice Reverts when a KPI-linked rate variant is supplied with non-pending or non-zero
     *         rate parameters, which the variant requires for dynamic computation.
     */
    error InterestRateIsKpiLinked();

    /**
     * @notice Reverts when a coupon identifier does not resolve to an existing corporate
     *         action.
     * @param couponID The coupon identifier that was not found.
     */
    error CouponNotFound(uint256 couponID);

    /**
     * @notice Schedules a new coupon corporate action and registers the snapshot/record-date
     *         tasks that drive its lifecycle.
     * @dev Restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state plus the
     *      project date-validity modifiers; emits `CouponSet`. Reverts with
     *      `CouponCreationFailed` if the underlying corporate-action store rejects the insert.
     * @param _newCoupon Coupon parameters captured at scheduling time.
     * @return couponID_ One-indexed identifier assigned to the new coupon.
     */
    function setCoupon(Coupon calldata _newCoupon) external returns (uint256 couponID_);

    /**
     * @notice Cancels a previously scheduled coupon before its execution date is reached.
     * @dev Restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state. Reverts with
     *      `CouponAlreadyExecuted` if the execution date has passed; otherwise marks the
     *      corporate action disabled and emits `CouponCancelled`.
     * @param _couponID One-indexed identifier of the coupon to cancel.
     * @return success_ True if the cancellation was recorded.
     */
    function cancelCoupon(uint256 _couponID) external returns (bool success_);

    /**
     * @notice Force-cancels a coupon regardless of its execution date.
     * @dev Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state
     *      and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally —
     *      bypasses `CouponAlreadyExecuted` — and emits `CouponForceCancelled`.
     * @param _couponID One-indexed identifier of the coupon to force-cancel.
     * @return success_ True if the force-cancellation was recorded.
     */
    function forceCancelCoupon(uint256 _couponID) external returns (bool success_);

    /**
     * @notice Returns the persisted coupon record together with its cancelled flag.
     * @dev Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon
     *      corporate action.
     * @param _couponID One-indexed coupon identifier.
     * @return registeredCoupon_ Stored coupon parameters bound to their snapshot id.
     * @return isDisabled_ True if the coupon has been cancelled.
     */
    function getCoupon(
        uint256 _couponID
    ) external view returns (RegisteredCoupon memory registeredCoupon_, bool isDisabled_);

    /**
     * @notice Returns the per-account view of a coupon, including the holder balance at the
     *         record date and the metadata required to compute the payable amount.
     * @dev Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon
     *      corporate action. Balance and `couponAmount` fields are only meaningful once
     *      `recordDateReached` is set on the returned struct.
     * @param _couponID One-indexed coupon identifier.
     * @param _account Holder address to query.
     * @return couponFor_ Holder-scoped coupon view.
     */
    function getCouponFor(uint256 _couponID, address _account) external view returns (CouponFor memory couponFor_);

    /**
     * @notice Returns the fractional coupon amount payable to a specific holder.
     * @dev Reverts via `onlyMatchingActionType` if `_couponID` does not resolve to a coupon
     *      corporate action. Numerator and denominator are only meaningful once
     *      `recordDateReached` is set on the returned struct.
     * @param _couponID One-indexed coupon identifier.
     * @param _account Holder address to query.
     * @return couponAmountFor_ Fractional payable amount for the holder.
     */
    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view returns (CouponAmountFor memory couponAmountFor_);

    /**
     * @notice Returns the total number of coupons scheduled under the coupon corporate-action
     *         type — cancelled coupons remain in the count.
     * @return couponCount_ Current coupon count.
     */
    function getCouponCount() external view returns (uint256 couponCount_);
}
