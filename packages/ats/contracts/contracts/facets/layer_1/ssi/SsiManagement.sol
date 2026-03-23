// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISsiManagement } from "./ISsiManagement.sol";
import { _SSI_MANAGER_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { AccessControlModifiers } from "../../../infrastructure/utils/AccessControlModifiers.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { SsiManagementStorageWrapper } from "../../../domain/core/SsiManagementStorageWrapper.sol";

abstract contract SsiManagement is ISsiManagement, AccessControlModifiers, PauseModifiers {
    function setRevocationRegistryAddress(
        address _revocationRegistryAddress
    ) external override onlyUnpaused onlyRole(_SSI_MANAGER_ROLE) returns (bool success_) {
        address oldRevocationRegistryAddress = SsiManagementStorageWrapper.getRevocationRegistryAddress();
        success_ = SsiManagementStorageWrapper.setRevocationRegistryAddress(_revocationRegistryAddress);
        emit RevocationRegistryUpdated(
            oldRevocationRegistryAddress,
            SsiManagementStorageWrapper.getRevocationRegistryAddress()
        );
    }

    function addIssuer(
        address _issuer
    ) external override onlyUnpaused onlyRole(_SSI_MANAGER_ROLE) returns (bool success_) {
        success_ = SsiManagementStorageWrapper.addIssuer(_issuer);
        if (!success_) {
            revert ListedIssuer(_issuer);
        }
        emit AddedToIssuerList(msg.sender, _issuer);
    }

    function removeIssuer(
        address _issuer
    ) external override onlyUnpaused onlyRole(_SSI_MANAGER_ROLE) returns (bool success_) {
        success_ = SsiManagementStorageWrapper.removeIssuer(_issuer);
        if (!success_) {
            revert UnlistedIssuer(_issuer);
        }
        emit RemovedFromIssuerList(msg.sender, _issuer);
    }

    function getRevocationRegistryAddress() external view override returns (address revocationRegistryAddress_) {
        return SsiManagementStorageWrapper.getRevocationRegistryAddress();
    }

    function isIssuer(address _issuer) external view override returns (bool) {
        return SsiManagementStorageWrapper.isIssuer(_issuer);
    }

    function getIssuerListCount() external view override returns (uint256 issuerListCount_) {
        return SsiManagementStorageWrapper.getIssuerListCount();
    }

    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return SsiManagementStorageWrapper.getIssuerListMembers(_pageIndex, _pageLength);
    }
}
