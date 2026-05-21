// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICorporateActions } from "./ICorporateActions.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CorporateActionsStorageWrapper } from "../../domain/core/CorporateActionsStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _CORPORATE_ACTIONS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CorporateActions
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing read-only corporate action query logic for a security
 *         token. Exposes retrieval of individual actions, paginated lists, type-scoped views,
 *         and content-hash deduplication checks.
 * @dev Implements `ICorporateActions`. All data is stored at `STORAGE_LOCATION_CORPORATE_ACTION`
 *      via `CorporateActionsStorageWrapper`. Write operations (add, cancel, update) are provided
 *      by domain-specific abstract contracts that extend this one. Intended to be inherited
 *      exclusively by `CorporateActionsFacet`.
 */
abstract contract CorporateActions is ICorporateActions, Modifiers {
    /// @inheritdoc ICorporateActions
    function initializeCorporateActions()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_CORPORATE_ACTIONS_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_CORPORATE_ACTIONS_RESOLVER_KEY);
        emit CorporateActionsInitialized();
    }

    /// @inheritdoc ICorporateActions
    function getCorporateAction(
        bytes32 _corporateActionId
    )
        external
        view
        override
        returns (bytes32 actionType_, uint256 actionIdByType_, bytes memory data_, bool isDisabled_)
    {
        (actionType_, actionIdByType_, data_, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(
            _corporateActionId
        );
    }

    /// @inheritdoc ICorporateActions
    function getCorporateActions(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionIdByType_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        )
    {
        (actionTypes_, actionIdByType_, datas_, isDisabled_) = CorporateActionsStorageWrapper.getCorporateActions(
            _pageIndex,
            _pageLength
        );
    }

    /// @inheritdoc ICorporateActions
    function getCorporateActionCount() external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = CorporateActionsStorageWrapper.getCorporateActionCount();
    }

    /// @inheritdoc ICorporateActions
    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = CorporateActionsStorageWrapper.getCorporateActionIds(_pageIndex, _pageLength);
    }

    /// @inheritdoc ICorporateActions
    function getCorporateActionCountByType(
        bytes32 _actionType
    ) external view override returns (uint256 corporateActionCount_) {
        corporateActionCount_ = CorporateActionsStorageWrapper.getCorporateActionCountByType(_actionType);
    }

    /// @inheritdoc ICorporateActions
    function getCorporateActionsByType(
        bytes32 actionType,
        uint256 pageIndex,
        uint256 pageLength
    )
        external
        view
        override
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionTypeIds_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        )
    {
        (actionTypes_, actionTypeIds_, datas_, isDisabled_) = CorporateActionsStorageWrapper.getCorporateActionsByType(
            actionType,
            pageIndex,
            pageLength
        );
    }

    /// @inheritdoc ICorporateActions
    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory corporateActionIds_) {
        corporateActionIds_ = CorporateActionsStorageWrapper.getCorporateActionIdsByType(
            _actionType,
            _pageIndex,
            _pageLength
        );
    }

    /// @inheritdoc ICorporateActions
    function actionContentHashExists(bytes32 _contentHash) external view returns (bool) {
        return CorporateActionsStorageWrapper.actionContentHashExists(_contentHash);
    }
}
