// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ssiManagementStorage } from "../../storage/CoreStorage.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import { ISsiManagement } from "../../facets/features/interfaces/ssi/ISsiManagement.sol";

/// @title LibSSI — Self-Sovereign Identity (SSI) management library
/// @notice Centralized SSI/issuer functionality extracted from SsiManagementStorageWrapper.sol
/// @dev Uses free function storage accessors from CoreStorage.sol, no inheritance
library LibSSI {
    using EnumerableSet for EnumerableSet.AddressSet;
    using LibPagination for EnumerableSet.AddressSet;

    function setRevocationRegistryAddress(address addr) internal returns (bool) {
        ssiManagementStorage().revocationRegistry = addr;
        return true;
    }

    function addIssuer(address issuer) internal returns (bool) {
        return ssiManagementStorage().issuerList.add(issuer);
    }

    function removeIssuer(address issuer) internal returns (bool) {
        return ssiManagementStorage().issuerList.remove(issuer);
    }

    function getRevocationRegistryAddress() internal view returns (address) {
        return ssiManagementStorage().revocationRegistry;
    }

    function getIssuerListCount() internal view returns (uint256) {
        return ssiManagementStorage().issuerList.length();
    }

    function getIssuerListMembers(uint256 pageIndex, uint256 pageLength) internal view returns (address[] memory) {
        return ssiManagementStorage().issuerList.getFromSet(pageIndex, pageLength);
    }

    function isIssuer(address issuer) internal view returns (bool) {
        return ssiManagementStorage().issuerList.contains(issuer);
    }

    function requireIssuer(address issuer) internal view {
        if (!isIssuer(issuer)) {
            revert ISsiManagement.AccountIsNotIssuer(issuer);
        }
    }
}
