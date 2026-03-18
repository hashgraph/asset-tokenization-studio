// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IDividend {
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
}
