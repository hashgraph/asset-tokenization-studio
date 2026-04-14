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
    }

    struct DividendAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }

    event DividendSet(
        bytes32 corporateActionId,
        uint256 dividendId,
        address indexed operator,
        uint256 indexed recordDate,
        uint256 indexed executionDate,
        uint256 amount,
        uint8 amountDecimals
    );
    event DividendCancelled(uint256 dividendId, address indexed operator);

    error DividendCreationFailed();
    error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId);

    function setDividend(Dividend calldata _newDividend) external returns (uint256 dividendID_);

    function cancelDividend(uint256 _dividendId) external returns (bool success_);

    function getDividend(
        uint256 _dividendID
    ) external view returns (RegisteredDividend memory registeredDividend_, bool isDisabled_);

    function getDividendFor(
        uint256 _dividendID,
        address _account
    ) external view returns (DividendFor memory dividendFor_);

    function getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) external view returns (DividendAmountFor memory dividendAmountFor_);

    function getDividendsCount() external view returns (uint256 dividendCount_);

    function getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function getTotalDividendHolders(uint256 _dividendID) external view returns (uint256);
}
