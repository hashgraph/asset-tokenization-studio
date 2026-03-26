// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface TRexIEquity {
    enum DividendType {
        NONE,
        PREFERRED,
        COMMON
    }

    struct EquityDetailsData {
        bool votingRight;
        bool informationRight;
        bool liquidationRight;
        bool subscriptionRight;
        bool conversionRight;
        bool redemptionRight;
        bool putRight;
        DividendType dividendRight;
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
    }

    struct Dividend {
        uint256 recordDate;
        uint256 executionDate;
        uint256 amount;
        uint8 amountDecimals;
    }

    struct RegisteredDividend {
        Dividend dividend;
        uint256 snapshotId;
    }

    struct DividendFor {
        uint256 tokenBalance;
        uint256 amount;
        uint8 amountDecimals;
        uint256 recordDate;
        uint256 executionDate;
        uint8 decimals;
        bool recordDateReached;
        bool isDisabled;
    }

    struct DividendAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }

    struct ScheduledBalanceAdjustment {
        uint256 executionDate;
        uint256 factor;
        uint8 decimals;
    }

    /**
     * @notice Sets a new dividend
     * @dev Can only be called by an account with the corporate actions role
     */
    function setDividend(Dividend calldata _newDividend) external returns (uint256 dividendID_);

    /**
     * @notice Cancels an existing dividend
     * @dev Can only be called by an account with the corporate actions role
     * @param _dividendId The ID of the dividend to cancel
     * @return success_ True if the dividend was cancelled successfully
     */
    function cancelDividend(uint256 _dividendId) external returns (bool success_);

    /**
     * @notice Sets a new scheduled balance adjustment
     * @dev The task is added to the queue and executed when the execution date is reached
     */
    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external returns (uint256 balanceAdjustmentID_);

    /**
     * @notice Cancels a scheduled balance adjustment
     * @dev Can only be called by an account with the corporate actions role.
     * @param _balanceAdjustmentId The ID of the scheduled balance adjustment to cancel
     * @return success_ True if the scheduled balance adjustment was cancelled successfully
     */
    function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentId) external returns (bool success_);

    function getEquityDetails() external view returns (EquityDetailsData memory equityDetailsData_);

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param _dividendID The dividend Id
     * @return registeredDividend_ The dividend data
     * @return isDisabled_ True if the dividend has been cancelled
     */
    function getDividend(
        uint256 _dividendID
    ) external view returns (RegisteredDividend memory registeredDividend_, bool isDisabled_);

    /**
     * @dev returns the dividends for an account.
     *
     * @param _dividendID The dividend Id
     * @param _account The account
     */
    function getDividendFor(
        uint256 _dividendID,
        address _account
    ) external view returns (DividendFor memory dividendFor_);

    /**
     * @notice Retrieves dividend amount numerator and denominator for a specific account and dividend ID
     */
    function getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) external view returns (DividendAmountFor memory dividendAmountFor_);

    /**
     * @notice returns the dividends count.
     */
    function getDividendsCount() external view returns (uint256 dividendCount_);

    /**
     * @notice Returns the list of token holders for a given dividend
     */
    function getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Returns the total number of token holders for a given dividend
     */
    function getTotalDividendHolders(uint256 _dividendID) external view returns (uint256);

    /**
     * @notice Returns the details of a previously scheduled balance adjustment
     */
    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) external view returns (ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_);

    /**
     * @notice Returns the total number of scheduled balance adjustments
     */
    function getScheduledBalanceAdjustmentCount() external view returns (uint256 balanceAdjustmentCount_);
}
