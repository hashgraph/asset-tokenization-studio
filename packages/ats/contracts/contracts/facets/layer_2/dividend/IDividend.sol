// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDividendTypes } from "./IDividendTypes.sol";

interface IDividend is IDividendTypes {
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

    function setDividend(Dividend calldata newDividend) external returns (uint256 dividendId_);

    function cancelDividend(uint256 dividendId) external returns (bool success_);

    function getDividend(
        uint256 dividendId
    ) external view returns (RegisteredDividend memory registeredDividend_, bool isDisabled_);

    function getDividendFor(
        uint256 dividendId,
        address account
    ) external view returns (DividendFor memory dividendFor_);

    function getDividendAmountFor(
        uint256 dividendId,
        address account
    ) external view returns (DividendAmountFor memory dividendAmountFor_);

    function getDividendsCount() external view returns (uint256 dividendCount_);

    function getDividendHolders(
        uint256 dividendId,
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory holders_);

    function getTotalDividendHolders(uint256 dividendId) external view returns (uint256);
}
