// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "./IExternalKycListManagement.sol";
import { _KYC_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _KYC_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "../../../domain/core/ExternalListManagementStorageWrapper.sol";
import { ArrayValidation } from "../../../infrastructure/utils/ArrayValidation.sol";
import { IKyc } from "../kyc/IKyc.sol";

abstract contract ExternalKycListManagement is IExternalKycListManagement, PauseStorageWrapper {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalKycLists(address[] calldata _kycLists) external override {
        if (ExternalListManagementStorageWrapper.isKycExternalInitialized()) revert AlreadyInitialized();
        ExternalListManagementStorageWrapper.initialize_ExternalKycLists(_kycLists);
    }

    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_KYC_MANAGER_ROLE, msg.sender);
        ArrayValidation.checkUniqueValues(_kycLists, _actives);
        success_ = ExternalListManagementStorageWrapper.updateExternalLists(
            _KYC_MANAGEMENT_STORAGE_POSITION,
            _kycLists,
            _actives
        );
        if (!success_) {
            revert ExternalKycListsNotUpdated(_kycLists, _actives);
        }
        emit ExternalKycListsUpdated(msg.sender, _kycLists, _actives);
    }

    function addExternalKycList(address _kycLists) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_KYC_MANAGER_ROLE, msg.sender);
        ExternalListManagementStorageWrapper.checkValidAddress(_kycLists);
        success_ = ExternalListManagementStorageWrapper.addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert ListedKycList(_kycLists);
        }
        emit AddedToExternalKycLists(msg.sender, _kycLists);
    }

    function removeExternalKycList(address _kycLists) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_KYC_MANAGER_ROLE, msg.sender);
        success_ = ExternalListManagementStorageWrapper.removeExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert UnlistedKycList(_kycLists);
        }
        emit RemovedFromExternalKycLists(msg.sender, _kycLists);
    }

    function isExternalKycList(address _kycList) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycList);
    }

    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view override returns (bool) {
        return ExternalListManagementStorageWrapper.isExternallyGranted(_account, _kycStatus);
    }

    function getExternalKycListsCount() external view override returns (uint256 externalKycListsCount_) {
        return ExternalListManagementStorageWrapper.getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

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
