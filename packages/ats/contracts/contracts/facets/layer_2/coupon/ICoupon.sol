// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponStorageWrapper } from "../../../domain/asset/coupon/ICouponStorageWrapper.sol";

interface ICoupon is ICouponStorageWrapper {
    /// @notice Status of the coupon rate calculation process
    enum RateCalculationStatus {
        PENDING,
        SET
    }

    /// @notice Core coupon data structure
    /// @dev Stores all relevant dates and rate information for a coupon payment
    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 startDate;
        uint256 endDate;
        uint256 fixingDate;
        uint256 rate;
        uint8 rateDecimals;
        RateCalculationStatus rateStatus;
    }

    /// @notice Registered coupon with snapshot reference
    /// @dev Links a coupon to a specific token holder snapshot
    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    /// @notice Coupon information for a specific account
    /// @dev Contains coupon details and account-specific data
    struct CouponFor {
        uint256 tokenBalance;
        uint256 nominalValue;
        uint8 decimals;
        bool recordDateReached;
        Coupon coupon;
        CouponAmountFor couponAmount;
        bool isDisabled;
    }

    /// @notice Coupon payment amount representation
    /// @dev Expressed as a fraction to handle rounding and precision
    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }

    /**
     * @notice Emitted when a coupon is created or updated for a security.
     * @param corporateActionId Unique identifier grouping related corporate actions.
     * @param couponId Identifier of the created or updated coupon.
     * @param operator Address that performed the operation.
     * @param coupon Coupon struct containing recordDate, executionDate, rate, and period.
     */
    event CouponSet(bytes32 corporateActionId, uint256 couponId, address indexed operator, ICoupon.Coupon coupon);

    /**
     * @notice Sets a new coupon for the security
     * @param _newCoupon The new coupon to be set
     */
    function setCoupon(Coupon calldata _newCoupon) external returns (uint256 couponID_);

    /**
     * @notice Cancels an existing coupon
     * @param _couponID The ID of the coupon to be cancelled
     */
    function cancelCoupon(uint256 _couponID) external returns (bool success_);

    /**
     * @notice Retrieves a registered coupon by its ID
     * @param _couponID The ID of the coupon to retrieve
     * @return registeredCoupon_ The registered coupon data
     * @return isDisabled_ Whether the coupon is disabled
     */
    function getCoupon(
        uint256 _couponID
    ) external view returns (RegisteredCoupon memory registeredCoupon_, bool isDisabled_);

    /**
     * @notice Retrieves coupon information for a specific account and coupon ID
     * @dev Return value includes user balance at coupon record date
     * @param _couponID The ID of the coupon
     * @param _account The account address
     * @return couponFor_ Coupon information for the specified account
     */
    function getCouponFor(uint256 _couponID, address _account) external view returns (CouponFor memory couponFor_);

    /**
     * @notice Retrieves coupon information for a specific coupon ID
     * @param _couponID The ID of the coupon
     * @param _pageIndex The page index for pagination
     * @param _pageLength The number of records per page
     * @return couponFor_ List of coupon information for accounts corresponding to the coupon ID
     * @return accounts_ List of account addresses corresponding to the coupon information
     */
    function getCouponsFor(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (CouponFor[] memory couponFor_, address[] memory accounts_);

    /**
     * @notice Retrieves coupon amount numerator and denominator for a specific account and coupon ID
     * @param _couponID The ID of the coupon
     * @param _account The account address
     * @return couponAmountFor_ Coupon amount information for the specified account, including numerator,
     */
    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view returns (CouponAmountFor memory couponAmountFor_);

    /**
     * @notice Retrieves the total number of coupons set for the security
     * @dev Pending coupons are included in the count
     */
    function getCouponCount() external view returns (uint256 couponCount_);

    /**
     * @notice Retrieves a paginated list of coupon holders for a specific coupon ID
     * @param _couponID The ID of the coupon
     * @param _pageIndex The page index for pagination
     * @param _pageLength The number of holders per page
     * @return holders_ Array of holder addresses
     */
    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Retrieves the total number of coupon holders for a specific coupon ID
     * @dev It is the list of token holders at the snapshot taken at the record date
     * @param _couponID The ID of the coupon
     * @return The total number of coupon holders
     */
    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256);

    /**
     * @notice Retrieves a coupon ID from the ordered list at a specific position
     * @param _pos The position in the ordered coupon list
     * @return couponID_ The coupon ID at the specified position
     */
    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_);

    /**
     * @notice Retrieves a paginated list of coupon IDs in order
     * @param _pageIndex The page index for pagination
     * @param _pageLength The number of coupons per page
     * @return couponIDs_ Array of coupon IDs for the specified page
     */
    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_);

    /**
     * @notice Retrieves the total number of coupons in the ordered list
     * @return total_ The total count of coupons
     */
    function getCouponsOrderedListTotal() external view returns (uint256 total_);
}
