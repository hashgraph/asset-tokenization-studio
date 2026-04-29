// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "./IExternalKycListManagement.sol";
import { KYC_MANAGER_ROLE } from "../../constants/roles.sol";
import { _KYC_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { IKyc } from "../layer_1/kyc/IKyc.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ExternalKycListManagement
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing external KYC list management logic for a security token.
 *         Maintains a list of trusted third-party KYC provider contracts whose combined KYC
 *         evaluation must be satisfied for an account to be considered externally KYC-granted.
 * @dev Implements `IExternalKycListManagement`. The external KYC list is stored in diamond storage
 *      at `_KYC_MANAGEMENT_STORAGE_POSITION` via `ExternalListManagementStorageWrapper`.
 *      All mutating functions after initialisation are gated by `KYC_MANAGER_ROLE` and the
 *      `onlyUnpaused` modifier inherited from `Modifiers`. Intended to be inherited exclusively
 *      by `ExternalKycListManagementFacet`.
 */
abstract contract ExternalKycListManagement is IExternalKycListManagement, Modifiers {
    /// @inheritdoc IExternalKycListManagement
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalKycLists(address[] calldata _kycLists) external override onlyNotKycExternalInitialized {
        ExternalListManagementStorageWrapper.initialize_ExternalKycLists(_kycLists);
    }

    /// @inheritdoc IExternalKycListManagement
    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external override onlyUnpaused onlyRole(KYC_MANAGER_ROLE) returns (bool success_) {
        ArrayValidation.checkUniqueValues(_kycLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            _KYC_MANAGEMENT_STORAGE_POSITION,
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
    ) external override onlyUnpaused onlyRole(KYC_MANAGER_ROLE) onlyValidAddress(_kycLists) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert ListedKycList(_kycLists);
        }
        emit AddedToExternalKycLists(EvmAccessors.getMsgSender(), _kycLists);
    }

    /// @inheritdoc IExternalKycListManagement
    function removeExternalKycList(
        address _kycLists
    ) external override onlyUnpaused onlyRole(KYC_MANAGER_ROLE) returns (bool success_) {
        success_ = ExternalListManagementStorageWrapper.removeExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert UnlistedKycList(_kycLists);
        }
        emit RemovedFromExternalKycLists(EvmAccessors.getMsgSender(), _kycLists);
    }

    /// @inheritdoc IExternalKycListManagement
    function isExternalKycList(address _kycList) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycList);
    }

    /// @inheritdoc IExternalKycListManagement
    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternallyGranted(_account, _kycStatus);
    }

    /// @inheritdoc IExternalKycListManagement
    function getExternalKycListsCount() external view override returns (uint256 externalKycListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    /// @inheritdoc IExternalKycListManagement
    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return
            ExternalListManagementStorageWrapper.getExternalListsMembers(
                _KYC_MANAGEMENT_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
