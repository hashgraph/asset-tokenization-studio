// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _SSI_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ISsiManagement } from "../../facets/layer_1/ssi/ISsiManagement.sol";

/**
 * @notice Storage struct for SSI management data
 * @param issuerList Set of addresses authorised as issuers
 * @param revocationRegistry Address of the registry handling credential revocations
 */
struct SsiManagementStorage {
    EnumerableSet.AddressSet issuerList;
    address revocationRegistry;
}

/**
 * @title SsiManagementStorageWrapper
 * @notice Provides access and management functions for SSI-related storage
 * @dev Implements the Diamond Storage Pattern to manage state across facets
 * @author Hashgraph
 */
library SsiManagementStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Sets the revocation registry address
     * @dev Updates the stored revocation registry address; does not validate input
     * @param _revocationRegistryAddress Address of revocation registry
     * @return success_ True if set successfully
     */
    function setRevocationRegistryAddress(address _revocationRegistryAddress) internal returns (bool success_) {
        ssiManagementStorage().revocationRegistry = _revocationRegistryAddress;
        return true;
    }

    /**
     * @notice Adds an address to the issuer list
     * @dev Mutates the issuer list by adding the specified address
     * @param _issuer Address to add
     * @return success_ True if added successfully
     */
    function addIssuer(address _issuer) internal returns (bool success_) {
        success_ = ssiManagementStorage().issuerList.add(_issuer);
    }

    /**
     * @notice Removes an address from the issuer list
     * @dev Mutates the issuer list by removing the specified address
     * @param _issuer Address to remove
     * @return success_ True if removed successfully
     */
    function removeIssuer(address _issuer) internal returns (bool success_) {
        success_ = ssiManagementStorage().issuerList.remove(_issuer);
    }

    /**
     * @notice Gets the revocation registry address
     * @dev Retrieves the currently set revocation registry address
     * @return revocationRegistryAddress_ Address of revocation registry
     */
    function getRevocationRegistryAddress() internal view returns (address revocationRegistryAddress_) {
        revocationRegistryAddress_ = ssiManagementStorage().revocationRegistry;
    }

    /**
     * @notice Gets the count of issuers in the list
     * @dev Returns the size of the issuer list
     * @return issuerListCount_ Number of issuers
     */
    function getIssuerListCount() internal view returns (uint256 issuerListCount_) {
        issuerListCount_ = ssiManagementStorage().issuerList.length();
    }

    /**
     * @notice Gets paginated issuer list members
     * @dev Utilises pagination to retrieve a subset of issuer addresses
     * @param _pageIndex Page index for pagination
     * @param _pageLength Number of items per page
     * @return members_ Array of issuer addresses
     */
    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        return ssiManagementStorage().issuerList.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Checks if an address is in the issuer list
     * @dev Provides read-only verification of issuer status
     * @param _issuer Address to check
     * @return True if address is an issuer
     */
    function isIssuer(address _issuer) internal view returns (bool) {
        return ssiManagementStorage().issuerList.contains(_issuer);
    }

    /**
     * @notice Reverts if address is not in the issuer list
     * @dev Throws custom error `AccountIsNotIssuer` when validation fails
     * @param _issuer Address to check
     */
    function requireIssuer(address _issuer) internal view {
        if (!isIssuer(_issuer)) revert ISsiManagement.AccountIsNotIssuer(_issuer);
    }

    /**
     * @notice Returns the SsiManagementStorage storage pointer for the diamond storage position
     * @dev Uses inline assembly to load the storage slot at `_SSI_MANAGEMENT_STORAGE_POSITION`
     * @return ssiManagement_ Storage pointer to SsiManagementStorage
     */
    function ssiManagementStorage() private pure returns (SsiManagementStorage storage ssiManagement_) {
        bytes32 position = _SSI_MANAGEMENT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ssiManagement_.slot := position
        }
    }
}
