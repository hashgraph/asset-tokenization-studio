// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDividendTypes } from "./IDividendTypes.sol";

/**
 * @title IDividend
 * @author Asset Tokenization Studio Team
 * @notice Writer-side interface for the Dividend domain — exposes the corporate-action lifecycle
 *         (`setDividend`, `cancelDividend`) plus the per-record reads that consumers need before
 *         executing or auditing a dividend.
 * @dev Inherits `IDividendTypes` for the shared struct tier (`Dividend`, `RegisteredDividend`,
 *      `DividendFor`, `DividendAmountFor`). Domain events and errors live on this writer
 *      interface (not on the shared types tier) so that read-only sibling facets such as
 *      `IDividendSecurityHolders` do not pick up symbols they never emit or revert with — a
 *      narrow EIP-165 interfaceId is the goal. Aggregated into the off-chain `IAsset` umbrella
 *      alongside the read-only sibling facets.
 */
interface IDividend is IDividendTypes {
    /**
     * @notice Emitted once when the dividend capability is initialised on a token.
     * @dev Fires exclusively from `initializeDividend`.
     */
    event DividendInitialized();

    /**
     * @notice Emitted when an operator schedules a new dividend corporate action.
     * @param corporateActionId Identifier of the underlying corporate action.
     * @param dividendId One-indexed dividend identifier within the dividend corporate action type.
     * @param operator Address that scheduled the dividend.
     * @param recordDate Unix timestamp of the snapshot taken to determine eligible holders.
     * @param executionDate Unix timestamp on which the dividend becomes payable.
     * @param amount Total amount distributed across eligible holders, scaled by `amountDecimals`.
     * @param amountDecimals Decimal precision applied to `amount`.
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
     * @notice Emitted when an operator cancels a previously scheduled dividend.
     * @dev Cancellation is rejected once the execution date has passed; see
     *      `DividendAlreadyExecuted`.
     * @param dividendId One-indexed identifier of the cancelled dividend.
     * @param operator Address that performed the cancellation.
     */
    event DividendCancelled(uint256 dividendId, address indexed operator);

    /**
     * @notice Reverts when the underlying corporate-action creation step returns the zero id,
     *         indicating the dividend could not be persisted.
     */
    error DividendCreationFailed();

    /**
     * @notice Reverts when an operator attempts to cancel a dividend whose execution date has
     *         already passed.
     * @param corporateActionId Identifier of the underlying corporate action.
     * @param dividendId One-indexed identifier of the dividend that cannot be cancelled.
     */
    error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId);

    /**
     * @notice Initialises the dividend capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeDividend() external;

    /**
     * @notice Schedules a new dividend corporate action and registers the snapshot/record-date
     *         tasks that drive its lifecycle.
     * @dev Restricted to `CORPORATE_ACTION_ROLE` and gated by the unpaused state plus the
     *      project's date-validity modifiers; emits `DividendSet`. Reverts with
     *      `DividendCreationFailed` if the underlying corporate-action store rejects the
     *      insert.
     * @param newDividend Dividend parameters captured at scheduling time.
     * @return dividendId_ One-indexed identifier assigned to the new dividend.
     */
    function setDividend(Dividend calldata newDividend) external returns (uint256 dividendId_);

    /**
     * @notice Cancels a previously scheduled dividend before its execution date is reached.
     * @dev Restricted to `CORPORATE_ACTION_ROLE` and gated by the unpaused state. Reverts with
     *      `DividendAlreadyExecuted` if the execution date has passed; otherwise marks the
     *      corporate action disabled and emits `DividendCancelled`.
     * @param dividendId One-indexed identifier of the dividend to cancel.
     * @return success_ True if the cancellation was recorded.
     */
    function cancelDividend(uint256 dividendId) external returns (bool success_);

    /**
     * @notice Returns the persisted dividend record together with its cancelled flag.
     * @dev Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend
     *      corporate action.
     * @param dividendId One-indexed dividend identifier.
     * @return registeredDividend_ Stored dividend parameters bound to their snapshot id.
     * @return isDisabled_ True if the dividend has been cancelled.
     */
    function getDividend(
        uint256 dividendId
    ) external view returns (RegisteredDividend memory registeredDividend_, bool isDisabled_);

    /**
     * @notice Returns the per-account view of a dividend, including the holder's balance at the
     *         record date and the metadata required to compute the payable amount.
     * @dev Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend
     *      corporate action. Balance and decimals fields are only meaningful once
     *      `recordDateReached` is set on the returned struct.
     * @param dividendId One-indexed dividend identifier.
     * @param account Holder address to query.
     * @return dividendFor_ Holder-scoped dividend view.
     */
    function getDividendFor(
        uint256 dividendId,
        address account
    ) external view returns (DividendFor memory dividendFor_);

    /**
     * @notice Returns the fractional dividend amount payable to a specific holder.
     * @dev Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend
     *      corporate action. Numerator and denominator are only meaningful once
     *      `recordDateReached` is set on the returned struct.
     * @param dividendId One-indexed dividend identifier.
     * @param account Holder address to query.
     * @return dividendAmountFor_ Fractional payable amount for the holder.
     */
    function getDividendAmountFor(
        uint256 dividendId,
        address account
    ) external view returns (DividendAmountFor memory dividendAmountFor_);

    /**
     * @notice Returns the total number of dividends scheduled under the dividend corporate-action
     *         type — cancelled dividends remain in the count.
     * @return dividendCount_ Current dividend count.
     */
    function getDividendsCount() external view returns (uint256 dividendCount_);
}
