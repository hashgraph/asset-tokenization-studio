// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "../interfaces/externalKycLists/IExternalKycListManagement.sol";
import { Common } from "../../layer_0/common/Common.sol";
import { _KYC_MANAGER_ROLE } from "../constants/roles.sol";
import { _KYC_MANAGEMENT_STORAGE_POSITION } from "../../layer_0/constants/storagePositions.sol";
import { IKyc } from "../interfaces/kyc/IKyc.sol";

abstract contract ExternalKycListManagement is IExternalKycListManagement, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalKycLists(
        address[] calldata _kycLists
    ) external override onlyUninitialized(_externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION).initialized) {
        ExternalListDataStorage storage externalKycListDataStorage = _externalListStorage(
            _KYC_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = _kycLists.length;
        for (uint256 index; index < length; ) {
            _addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists[index]);
            unchecked {
                ++index;
            }
        }
        externalKycListDataStorage.initialized = true;
    }

    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    )
        external
        override
        onlyRole(_KYC_MANAGER_ROLE)
        onlyUnpaused
        onlyConsistentActivations(_kycLists, _actives)
        returns (bool success_)
    {
        success_ = _updateExternalLists(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists, _actives);
        if (!success_) {
            revert ExternalKycListsNotUpdated(_kycLists, _actives);
        }
        emit ExternalKycListsUpdated(_msgSender(), _kycLists, _actives);
    }

    function addExternalKycList(
        address _kycLists
    ) external override onlyRole(_KYC_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert ListedKycList(_kycLists);
        }
        emit AddedToExternalKycLists(_msgSender(), _kycLists);
    }

    function removeExternalKycList(
        address _kycLists
    ) external override onlyRole(_KYC_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _removeExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert UnlistedKycList(_kycLists);
        }
        emit RemovedFromExternalKycLists(_msgSender(), _kycLists);
    }

    function isExternalKycList(address _kycList) external view override returns (bool) {
        return _isExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycList);
    }

    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view override returns (bool) {
        return _isExternallyGranted(_account, _kycStatus);
    }

    function getExternalKycListsCount() external view override returns (uint256 externalKycListsCount_) {
        return _getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return _getExternalListsMembers(_KYC_MANAGEMENT_STORAGE_POSITION, _pageIndex, _pageLength);
    }
}
