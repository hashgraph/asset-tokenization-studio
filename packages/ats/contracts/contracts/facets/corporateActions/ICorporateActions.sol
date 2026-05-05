// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/**
 * @title ICorporateActions
 * @author Asset Tokenization Studio Team
 * @notice Interface for reading corporate action records stored on a security token. Corporate
 *         actions represent issuer-initiated events (e.g. dividends, votes, KPI settlements)
 *         that are registered on-chain and classified by an arbitrary `bytes32` action type.
 * @dev Part of the Diamond facet system. Corporate actions are stored at
 *      `_CORPORATE_ACTION_STORAGE_POSITION` via `CorporateActionsStorageWrapper`. Each action
 *      is assigned a 1-based sequential `bytes32` ID and de-duplicated by a content hash of
 *      `keccak256(abi.encode(actionType, data))`. Write operations (add, cancel, update) are
 *      defined in domain-specific interfaces that extend this one.
 */
interface ICorporateActions is ICommonErrors {
    /**
     * @notice Emitted when a new corporate action is registered on the token.
     * @param operator Address of the caller who added the corporate action.
     * @param actionType Classification key for the corporate action (e.g. dividend, vote).
     * @param corporateActionId Unique sequential identifier for the corporate action (1-based,
     *        cast to `bytes32`).
     * @param corporateActionIdByType Sequential index of this action within its action type.
     * @param data ABI-encoded payload defining the corporate action details.
     */
    event CorporateActionAdded(
        address indexed operator,
        bytes32 indexed actionType,
        bytes32 indexed corporateActionId,
        uint256 corporateActionIdByType,
        bytes data
    );

    /**
     * @notice Emitted when a corporate action is cancelled (disabled).
     * @param corporateActionId Unique identifier of the corporate action that was cancelled.
     */
    event CorporateActionCancelled(bytes32 indexed corporateActionId);

    /**
     * @notice Thrown when attempting to add a corporate action whose content hash already exists.
     * @dev De-duplication is enforced via `keccak256(abi.encode(actionType, data))`.
     * @param actionType The action type of the duplicate corporate action.
     * @param data The ABI-encoded payload of the duplicate corporate action.
     */
    error DuplicatedCorporateAction(bytes32 actionType, bytes data);

    /**
     * @notice Thrown when a type-scoped index does not correspond to an existing action.
     * @param index The out-of-range index that was provided.
     * @param actionType The action type against which the index was validated.
     */
    error WrongIndexForAction(uint256 index, bytes32 actionType);

    /**
     * @notice Thrown when a lookup by `corporateActionId` returns no matching record.
     * @param corporateActionId The identifier that was not found.
     */
    error CorporateActionNotFound(bytes32 corporateActionId);

    /**
     * @notice Thrown when attempting to cancel a corporate action that is already disabled.
     * @param corporateActionId The identifier of the already-disabled corporate action.
     */
    error CorporateActionAlreadyDisabled(bytes32 corporateActionId);

    /**
     * @notice Returns the stored details for a single corporate action.
     * @param _corporateActionId Unique `bytes32` identifier of the corporate action to retrieve.
     * @return actionType_ Classification key for the action.
     * @return actionIdByType_ Sequential index of this action within its action type.
     * @return data_ ABI-encoded payload containing the action details.
     * @return isDisabled_ True if the action has been cancelled, false otherwise.
     */
    function getCorporateAction(
        bytes32 _corporateActionId
    ) external view returns (bytes32 actionType_, uint256 actionIdByType_, bytes memory data_, bool isDisabled_);

    /**
     * @notice Returns the total number of corporate actions registered on the token.
     * @return corporateActionCount_ The total count of registered corporate actions.
     */
    function getCorporateActionCount() external view returns (uint256 corporateActionCount_);

    /**
     * @notice Returns a paginated slice of corporate action identifiers.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the total action count.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of identifiers to return per page.
     * @return corporateActionIds_ Array of corporate action identifiers for the requested page.
     */
    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory corporateActionIds_);

    /**
     * @notice Returns a paginated slice of full corporate action records.
     * @dev Internally resolves each paginated ID to its full `ActionData`. The list offset is
     *      computed as `_pageIndex * _pageLength`.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of records to return per page.
     * @return actionTypes_ Array of action classification keys.
     * @return actionIdByType_ Array of per-type sequential indices.
     * @return datas_ Array of ABI-encoded action payloads.
     * @return isDisabled_ Array of disabled flags; `true` means the action has been cancelled.
     */
    function getCorporateActions(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionIdByType_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        );

    /**
     * @notice Returns the number of corporate actions registered under a specific action type.
     * @param _actionType The action type to count.
     * @return corporateActionCount_ The number of actions registered for `_actionType`.
     */
    function getCorporateActionCountByType(bytes32 _actionType) external view returns (uint256 corporateActionCount_);

    /**
     * @notice Returns a paginated slice of corporate action identifiers for a specific action
     *         type.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the count for that type.
     * @param _actionType The action type to filter by.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of identifiers to return per page.
     * @return corporateActionIds_ Array of corporate action identifiers for the requested page.
     */
    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory corporateActionIds_);

    /**
     * @notice Returns a paginated slice of full corporate action records for a specific action
     *         type.
     * @dev Internally resolves each paginated type-scoped ID to its full `ActionData`. The list
     *      offset is computed as `_pageIndex * _pageLength`.
     * @param _actionType The action type to filter by.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of records to return per page.
     * @return actionTypes_ Array of action classification keys.
     * @return actionIdByType_ Array of per-type sequential indices.
     * @return datas_ Array of ABI-encoded action payloads.
     * @return isDisabled_ Array of disabled flags; `true` means the action has been cancelled.
     */
    function getCorporateActionsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionIdByType_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        );

    /**
     * @notice Checks whether a content hash derived from an action type and payload already
     *         exists.
     * @dev The content hash is `keccak256(abi.encode(actionType, data))`. Callers can use this
     *      to detect duplicate corporate actions before submitting a registration.
     * @param _contentHash The pre-computed content hash to look up.
     * @return True if a corporate action with this content hash has already been registered,
     *         false otherwise.
     */
    function actionContentHashExists(bytes32 _contentHash) external view returns (bool);
}
