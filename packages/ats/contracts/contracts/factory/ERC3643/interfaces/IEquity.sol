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

    struct Voting {
        uint256 recordDate;
        bytes data;
    }

    struct RegisteredVoting {
        Voting voting;
        uint256 snapshotId;
    }

    struct Dividend {
        uint256 recordDate;
        uint256 executionDate;
        uint256 amount;
    }

    struct RegisteredDividend {
        Dividend dividend;
        uint256 snapshotId;
    }

    struct DividendFor {
        uint256 tokenBalance;
        uint256 amount;
        uint256 recordDate;
        uint256 executionDate;
        uint8 decimals;
        bool recordDateReached;
    }

    struct VotingFor {
        uint256 tokenBalance;
        uint256 recordDate;
        bytes data;
        uint8 decimals;
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
    function setDividends(Dividend calldata _newDividend) external returns (bool success_, uint256 dividendID_);

    /**
     * @notice Sets a new voting
     * @dev Can only be called by an account with the corporate actions role
     */
    function setVoting(Voting calldata _newVoting) external returns (bool success_, uint256 voteID_);

    /**
     * @notice Sets a new scheduled balance adjustment
     * @dev The task is added to the queue and executed when the execution date is reached
     */
    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external returns (bool success_, uint256 balanceAdjustmentID_);

    function getEquityDetails() external view returns (EquityDetailsData memory equityDetailsData_);

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param _dividendID The dividend Id
     */
    function getDividends(uint256 _dividendID) external view returns (RegisteredDividend memory registeredDividend_);

    /**
     * @dev returns the dividends for an account.
     *
     * @param _dividendID The dividend Id
     * @param _account The account
     */
    function getDividendsFor(
        uint256 _dividendID,
        address _account
    ) external view returns (DividendFor memory dividendFor_);

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
     * @notice Returns the details of a previously registered voting
     */
    function getVoting(uint256 _voteID) external view returns (RegisteredVoting memory registeredVoting_);

    /**
     * @notice Returns the voting details for an account
     */
    function getVotingFor(uint256 _voteID, address _account) external view returns (VotingFor memory votingFor_);

    /**
     * @notice Returns the total number of votings
     */
    function getVotingCount() external view returns (uint256 votingCount_);

    /**
     * @notice Returns the list of token holders for a given voting
     */
    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Returns the total number of token holders for a given voting
     */
    function getTotalVotingHolders(uint256 _voteID) external view returns (uint256);

    /**
     * @notice Returns the details of a previously scheduled balance adjustment
     */
    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) external view returns (ScheduledBalanceAdjustment memory balanceAdjustment_);

    /**
     * @notice Returns the total number of scheduled balance adjustments
     */
    function getScheduledBalanceAdjustmentCount() external view returns (uint256 balanceAdjustmentCount_);
}
