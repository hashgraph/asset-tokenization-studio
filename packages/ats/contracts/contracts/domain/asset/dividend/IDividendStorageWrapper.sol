// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IDividendStorageWrapper
 * @notice Defines the events and errors emitted by the dividend storage layer.
 * @dev Implemented by DividendStorageWrapper to signal dividend lifecycle transitions
 *      (creation and cancellation) and to surface domain-specific failure conditions.
 */
interface IDividendStorageWrapper {
    /**
     * @notice Emitted when a new dividend corporate action is recorded.
     * @param corporateActionId Unique identifier of the underlying corporate action.
     * @param dividendId Sequential index of the dividend within this asset.
     * @param operator Address that created the dividend.
     * @param recordDate Timestamp at which token balances are snapshotted for distribution eligibility.
     * @param executionDate Timestamp at or after which the dividend payout is executed.
     * @param amount Gross dividend amount expressed in the asset's payment token units.
     * @param amountDecimals Decimal precision of `amount`.
     */
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

    /**
     * @notice Thrown when the underlying corporate action could not be created for a new dividend.
     * @dev Triggered in `_initDividend` when `_addCorporateAction` returns a zero action ID,
     *      indicating an internal storage failure.
     */
    error DividendCreationFailed();

    /**
     * @notice Thrown when attempting to cancel a dividend whose execution date has already passed.
     * @dev A dividend whose `executionDate <= block.timestamp` is considered immutable.
     * @param corporateActionId Identifier of the corporate action tied to the dividend.
     * @param dividendId Sequential identifier of the dividend that cannot be cancelled.
     */
    error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId);
}
