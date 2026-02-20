// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISsiManagement } from "../interfaces/ISsiManagement.sol";
import { LibSSI } from "../../../lib/core/LibSSI.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { _SSI_MANAGER_ROLE } from "../../../constants/roles.sol";

abstract contract SsiManagement is ISsiManagement {
    /// @notice Update the revocation registry address
    /// @param _revocationRegistryAddress The new revocation registry address
    /// @return success_ True if the operation was successful
    function setRevocationRegistryAddress(
        address _revocationRegistryAddress
    ) external override returns (bool success_) {
        LibAccess.checkRole(_SSI_MANAGER_ROLE);
        LibPause.requireNotPaused();
        address oldRevocationRegistryAddress = LibSSI.getRevocationRegistryAddress();
        success_ = LibSSI.setRevocationRegistryAddress(_revocationRegistryAddress);
        emit RevocationRegistryUpdated(oldRevocationRegistryAddress, LibSSI.getRevocationRegistryAddress());
    }

    /// @notice Add an issuer to the issuer list
    /// @param _issuer The issuer address to add
    /// @return success_ True if the operation was successful
    function addIssuer(address _issuer) external override returns (bool success_) {
        LibAccess.checkRole(_SSI_MANAGER_ROLE);
        LibPause.requireNotPaused();
        success_ = LibSSI.addIssuer(_issuer);
        if (!success_) {
            revert ListedIssuer(_issuer);
        }
        emit AddedToIssuerList(msg.sender, _issuer);
    }

    /// @notice Remove an issuer from the issuer list
    /// @param _issuer The issuer address to remove
    /// @return success_ True if the operation was successful
    function removeIssuer(address _issuer) external override returns (bool success_) {
        LibAccess.checkRole(_SSI_MANAGER_ROLE);
        LibPause.requireNotPaused();
        success_ = LibSSI.removeIssuer(_issuer);
        if (!success_) {
            revert UnlistedIssuer(_issuer);
        }
        emit RemovedFromIssuerList(msg.sender, _issuer);
    }

    /// @notice Get the revocation registry address
    /// @return revocationRegistryAddress_ The current revocation registry address
    function getRevocationRegistryAddress() external view override returns (address revocationRegistryAddress_) {
        return LibSSI.getRevocationRegistryAddress();
    }

    /// @notice Check if an account is an issuer
    /// @param _issuer The address to check
    /// @return True if the address is an issuer, false otherwise
    function isIssuer(address _issuer) external view override returns (bool) {
        return LibSSI.isIssuer(_issuer);
    }

    /// @notice Get the count of issuers in the issuer list
    /// @return issuerListCount_ The number of issuers
    function getIssuerListCount() external view override returns (uint256 issuerListCount_) {
        return LibSSI.getIssuerListCount();
    }

    /// @notice Get a paginated list of issuer addresses
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return members_ Array of issuer addresses for the requested page
    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        return LibSSI.getIssuerListMembers(_pageIndex, _pageLength);
    }
}
