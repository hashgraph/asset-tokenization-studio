// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ISsiManagement } from "../../facets/ssiManagement/ISsiManagement.sol";

/// @custom:hash storage SsiManagement
bytes32 constant STORAGE_LOCATION_SSI_MANAGEMENT = 0xce722d9244e395d588d86bfe2318b3330226793a6bcb3ce028d3286061fb2f00;

/**
 * @notice ERC-7201 namespaced storage backing the SSI management subsystem.
 * @dev Holds the revocation registry address and the authorised issuer set.
 *      Field ordering follows the project's 5-region convention; new fields
 *      must be appended below the marker to preserve slot stability.
 * @custom:storage-location erc7201:security.token.standard.storage.SsiManagement
 */
struct SsiManagementStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    address revocationRegistry;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    EnumerableSet.AddressSet issuerList;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title SsiManagementStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Internal accessor library for the SSI management ERC-7201 storage namespace.
 * @dev Centralises reads, writes, and presence checks against the issuer set and the
 *      revocation registry pointer. All helpers are `internal` and operate on the
 *      ERC-7201 slot resolved by {ssiManagementStorage}.
 */
library SsiManagementStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Stores the revocation registry contract address.
     * @param _revocationRegistryAddress The address of the revocation registry to record.
     * @return success_ Always true once the write completes.
     */
    function setRevocationRegistryAddress(address _revocationRegistryAddress) internal returns (bool success_) {
        ssiManagementStorage().revocationRegistry = _revocationRegistryAddress;
        return true;
    }

    /**
     * @notice Adds an issuer to the authorised issuer set.
     * @param _issuer Address to authorise as an issuer.
     * @return success_ True if the issuer was newly added; false if already present.
     */
    function addIssuer(address _issuer) internal returns (bool success_) {
        success_ = ssiManagementStorage().issuerList.add(_issuer);
    }

    /**
     * @notice Removes an issuer from the authorised issuer set.
     * @param _issuer Address to revoke as an issuer.
     * @return success_ True if the issuer was removed; false if not present.
     */
    function removeIssuer(address _issuer) internal returns (bool success_) {
        success_ = ssiManagementStorage().issuerList.remove(_issuer);
    }

    /**
     * @notice Returns the currently configured revocation registry address.
     * @return revocationRegistryAddress_ The stored revocation registry address.
     */
    function getRevocationRegistryAddress() internal view returns (address revocationRegistryAddress_) {
        revocationRegistryAddress_ = ssiManagementStorage().revocationRegistry;
    }

    /**
     * @notice Returns the number of authorised issuers.
     * @return issuerListCount_ Cardinality of the issuer set.
     */
    function getIssuerListCount() internal view returns (uint256 issuerListCount_) {
        issuerListCount_ = ssiManagementStorage().issuerList.length();
    }

    /**
     * @notice Returns a paginated slice of the issuer set.
     * @param _pageIndex Zero-based page index to fetch.
     * @param _pageLength Maximum number of issuers per page.
     * @return members_ The issuer addresses contained in the requested page.
     */
    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        return ssiManagementStorage().issuerList.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Indicates whether an address is currently an authorised issuer.
     * @param _issuer The address to query.
     * @return True if the address belongs to the issuer set.
     */
    function isIssuer(address _issuer) internal view returns (bool) {
        return ssiManagementStorage().issuerList.contains(_issuer);
    }

    /**
     * @notice Reverts unless the supplied address is an authorised issuer.
     * @dev Reverts with {ISsiManagement.AccountIsNotIssuer} when membership is missing.
     * @param _issuer The address whose issuer membership must be enforced.
     */
    function requireIssuer(address _issuer) internal view {
        if (!isIssuer(_issuer)) revert ISsiManagement.AccountIsNotIssuer(_issuer);
    }

    /**
     * @notice Resolves the ERC-7201 storage pointer for the SSI management namespace.
     * @dev Uses inline assembly to bind the struct to {STORAGE_LOCATION_SSI_MANAGEMENT}.
     * @return ssiManagement_ Storage reference to the {SsiManagementStorage} layout.
     */
    function ssiManagementStorage() internal pure returns (SsiManagementStorage storage ssiManagement_) {
        bytes32 position = STORAGE_LOCATION_SSI_MANAGEMENT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ssiManagement_.slot := position
        }
    }
}
