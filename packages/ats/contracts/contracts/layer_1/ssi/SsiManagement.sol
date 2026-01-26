// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "contracts/layer_0/Internals.sol";
import { _SSI_MANAGER_ROLE } from "../constants/roles.sol";
import { ISsiManagement } from "../interfaces/ssi/ISsiManagement.sol";

abstract contract SsiManagement is ISsiManagement, Internals {
    function setRevocationRegistryAddress(
        address _revocationRegistryAddress
    ) external override onlyRole(_SSI_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        address oldRevocationRegistryAddress = _getRevocationRegistryAddress();
        success_ = _setRevocationRegistryAddress(_revocationRegistryAddress);
        emit RevocationRegistryUpdated(oldRevocationRegistryAddress, _getRevocationRegistryAddress());
    }

    function addIssuer(
        address _issuer
    ) external override onlyRole(_SSI_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _addIssuer(_issuer);
        if (!success_) {
            revert ListedIssuer(_issuer);
        }
        emit AddedToIssuerList(_msgSender(), _issuer);
    }

    function removeIssuer(
        address _issuer
    ) external override onlyRole(_SSI_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _removeIssuer(_issuer);
        if (!success_) {
            revert UnlistedIssuer(_issuer);
        }
        emit RemovedFromIssuerList(_msgSender(), _issuer);
    }

    function getRevocationRegistryAddress() external view override returns (address revocationRegistryAddress_) {
        return _getRevocationRegistryAddress();
    }

    function isIssuer(address _issuer) external view override returns (bool) {
        return _isIssuer(_issuer);
    }

    function getIssuerListCount() external view override returns (uint256 issuerListCount_) {
        return _getIssuerListCount();
    }

    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return _getIssuerListMembers(_pageIndex, _pageLength);
    }
}
