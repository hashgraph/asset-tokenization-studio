// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISsiManagement } from "./ISsiManagement.sol";
import { SSI_MANAGER_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { SsiManagementStorageWrapper } from "../../domain/core/SsiManagementStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title SsiManagement
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing Self-Sovereign Identity (SSI) management logic for a
 *         security token, including control of the trusted issuer list and the revocation registry
 *         address.
 * @dev Implements `ISsiManagement`. All persistent state is delegated to diamond storage via
 *      `SsiManagementStorageWrapper`. Every mutating function is gated by `SSI_MANAGER_ROLE` and
 *      the `onlyUnpaused` modifier inherited from `Modifiers`. Intended to be inherited exclusively
 *      by `SsiManagementFacet`.
 */
abstract contract SsiManagement is ISsiManagement, Modifiers {
    /// @inheritdoc ISsiManagement
    function setRevocationRegistryAddress(
        address _revocationRegistryAddress
    ) external override onlyUnpaused onlyRole(SSI_MANAGER_ROLE) returns (bool success_) {
        address oldRevocationRegistryAddress = SsiManagementStorageWrapper.getRevocationRegistryAddress();
        success_ = SsiManagementStorageWrapper.setRevocationRegistryAddress(_revocationRegistryAddress);
        emit RevocationRegistryUpdated(
            oldRevocationRegistryAddress,
            SsiManagementStorageWrapper.getRevocationRegistryAddress()
        );
    }

    /// @inheritdoc ISsiManagement
    function addIssuer(
        address _issuer
    ) external override onlyUnpaused onlyRole(SSI_MANAGER_ROLE) returns (bool success_) {
        success_ = SsiManagementStorageWrapper.addIssuer(_issuer);
        if (!success_) {
            revert ListedIssuer(_issuer);
        }
        emit AddedToIssuerList(EvmAccessors.getMsgSender(), _issuer);
    }

    /// @inheritdoc ISsiManagement
    function removeIssuer(
        address _issuer
    ) external override onlyUnpaused onlyRole(SSI_MANAGER_ROLE) returns (bool success_) {
        success_ = SsiManagementStorageWrapper.removeIssuer(_issuer);
        if (!success_) {
            revert UnlistedIssuer(_issuer);
        }
        emit RemovedFromIssuerList(EvmAccessors.getMsgSender(), _issuer);
    }

    /// @inheritdoc ISsiManagement
    function getRevocationRegistryAddress() external view override returns (address revocationRegistryAddress_) {
        return SsiManagementStorageWrapper.getRevocationRegistryAddress();
    }

    /// @inheritdoc ISsiManagement
    function isIssuer(address _issuer) external view override returns (bool) {
        return SsiManagementStorageWrapper.isIssuer(_issuer);
    }

    /// @inheritdoc ISsiManagement
    function getIssuerListCount() external view override returns (uint256 issuerListCount_) {
        return SsiManagementStorageWrapper.getIssuerListCount();
    }

    /// @inheritdoc ISsiManagement
    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return SsiManagementStorageWrapper.getIssuerListMembers(_pageIndex, _pageLength);
    }
}
