// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IDividendStorageWrapper {
    event DividendSet(
        bytes32 corporateActionId,
        uint256 dividendId,
        address indexed operator,
        uint256 indexed recordDate,
        uint256 indexed executionDate,
        uint256 amount,
        uint8 amountDecimals
    );

    /**
     * @notice Emitted when a dividend is cancelled.
     * @param dividendId Identifier of the cancelled dividend.
     * @param operator Address that performed the cancellation.
     */
    event DividendCancelled(uint256 dividendId, address indexed operator);

    error DividendCreationFailed();
    error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId);
}
