// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycListManagement } from "../interfaces/IExternalKycListManagement.sol";
import { IExternalKycList } from "../interfaces/IExternalKycList.sol";
import { LibExternalLists } from "../../../lib/core/LibExternalLists.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { _KYC_MANAGER_ROLE } from "../../../constants/roles.sol";
import { _KYC_MANAGEMENT_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { LibArrayValidation } from "../../../infrastructure/lib/LibArrayValidation.sol";
import { IKyc } from "../interfaces/IKyc.sol";

abstract contract ExternalKycListManagement is IExternalKycListManagement {
    error AlreadyInitialized();
    error InconsistentArrayLengths();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalKycLists(address[] calldata _kycLists) external override {
        if (LibExternalLists.getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION) > 0) {
            revert AlreadyInitialized();
        }
        uint256 length = _kycLists.length;
        for (uint256 index; index < length; ) {
            LibExternalLists.requireValidAddress(_kycLists[index]);
            LibExternalLists.addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists[index]);
            unchecked {
                ++index;
            }
        }
        LibExternalLists.setExternalListInitialized(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external override returns (bool success_) {
        LibAccess.checkRole(_KYC_MANAGER_ROLE);
        LibPause.requireNotPaused();
        if (_kycLists.length != _actives.length) {
            revert InconsistentArrayLengths();
        }
        LibArrayValidation.checkUniqueValues(_kycLists, _actives);
        success_ = LibExternalLists.updateExternalLists(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists, _actives);
        if (!success_) {
            revert ExternalKycListsNotUpdated(_kycLists, _actives);
        }
        emit ExternalKycListsUpdated(msg.sender, _kycLists, _actives);
    }

    function addExternalKycList(address _kycLists) external override returns (bool success_) {
        LibAccess.checkRole(_KYC_MANAGER_ROLE);
        LibPause.requireNotPaused();
        LibExternalLists.requireValidAddress(_kycLists);
        success_ = LibExternalLists.addExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert ListedKycList(_kycLists);
        }
        emit AddedToExternalKycLists(msg.sender, _kycLists);
    }

    function removeExternalKycList(address _kycLists) external override returns (bool success_) {
        LibAccess.checkRole(_KYC_MANAGER_ROLE);
        LibPause.requireNotPaused();
        success_ = LibExternalLists.removeExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycLists);
        if (!success_) {
            revert UnlistedKycList(_kycLists);
        }
        emit RemovedFromExternalKycLists(msg.sender, _kycLists);
    }

    function isExternalKycList(address _kycList) external view override returns (bool) {
        return LibExternalLists.isExternalList(_KYC_MANAGEMENT_STORAGE_POSITION, _kycList);
    }

    function isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) external view override returns (bool) {
        uint256 length = LibExternalLists.getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            address kycListAddress = LibExternalLists.getExternalListsMembers(
                _KYC_MANAGEMENT_STORAGE_POSITION,
                index,
                1
            )[0];
            if (IExternalKycList(kycListAddress).getKycStatus(_account) != _kycStatus) {
                return false;
            }
            unchecked {
                ++index;
            }
        }
        return true;
    }

    function getExternalKycListsCount() external view override returns (uint256 externalKycListsCount_) {
        return LibExternalLists.getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
    }

    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return LibExternalLists.getExternalListsMembers(_KYC_MANAGEMENT_STORAGE_POSITION, _pageIndex, _pageLength);
    }
}
