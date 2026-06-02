// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement, RESOLVER_KEY_EXTERNAL_KYC_LIST } from "./IExternalKycListManagement.sol";
import { ROLE_KYC_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { STORAGE_LOCATION_KYC_MANAGEMENT } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { IKyc } from "../kyc/IKyc.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ExternalKycListManagement
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing external onlyOperational KYC list management logic for a security token.
 *         Maintains a list of trusted third-party KYC provider contracts whose combined KYC
 *         evaluation must be satisfied for an account to be considered externally KYC-granted.
 * @dev Implements `IExternalKycListManagement`. The external onlyOperational KYC list is stored in diamond storage
 *      at `STORAGE_LOCATION_KYC_MANAGEMENT` via `ExternalListManagementStorageWrapper`.
 *      All mutating functions after initialisation are gated by `ROLE_KYC_MANAGER` and the
 *      `onlyUnpaused` modifier inherited from `Modifiers`. Intended to be inherited exclusively
 *      by `ExternalKycListManagementFacet`.
 */
abstract contract ExternalKycListManagement is IExternalKycListManagement, Modifiers {
    /// @inheritdoc IExternalKycListManagement
    function initializeExternalKycLists(
        address[] calldata _kycLists
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_EXTERNAL_KYC_LIST) {
        ExternalListManagementStorageWrapper.initializeExternalKycLists(_kycLists);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_EXTERNAL_KYC_LIST);
        emit IExternalKycListManagement.ExternalKycListInitialized(_kycLists);
    }

    /// @inheritdoc IExternalKycListManagement
    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_KYC_MANAGER) returns (bool success_) {
        ArrayValidation.checkUniqueValues(_kycLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            STORAGE_LOCATION_KYC_MANAGEMENT,
            _kycLists,
            _actives
        );
        if (!success_) {
            revert ExternalKycListsNotUpdated(_kycLists, _actives);
        }
        emit ExternalKycListsUpdated(EvmAccessors.getMsgSender(), _kycLists, _actives);
    }

    /// @inheritdoc IExternalKycListManagement
    function addExternalKycList(
        address _kycLists
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_KYC_MANAGER)
        onlyValidAddress(_kycLists)
        returns (bool success_)
    {
        success_ = ExternalListManagementStorageWrapper.addExternalList(STORAGE_LOCATION_KYC_MANAGEMENT, _kycLists);
        if (!success_) {
            revert ListedKycList(_kycLists);
        }
        emit AddedToExternalKycLists(EvmAccessors.getMsgSender(), _kycLists);
    }

    /// @inheritdoc IExternalKycListManagement
    function removeExternalKycList(
        address _kycLists
    ) external override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_KYC_MANAGER) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(STORAGE_LOCATION_KYC_MANAGEMENT, _kycLists);
        if (!success_) {
            revert UnlistedKycList(_kycLists);
        }
        emit RemovedFromExternalKycLists(EvmAccessors.getMsgSender(), _kycLists);
    }

    /// @inheritdoc IExternalKycListManagement
    function isExternalKycList(address _kycList) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternalList(STORAGE_LOCATION_KYC_MANAGEMENT, _kycList);
    }

    /// @inheritdoc IExternalKycListManagement
    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternallyGranted(_account, _kycStatus);
    }

    /// @inheritdoc IExternalKycListManagement
    function getExternalKycListsCount() external view override returns (uint256 externalKycListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(STORAGE_LOCATION_KYC_MANAGEMENT);
    }

    /// @inheritdoc IExternalKycListManagement
    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                STORAGE_LOCATION_KYC_MANAGEMENT,
                _pageIndex,
                _pageLength
            );
    }
}
