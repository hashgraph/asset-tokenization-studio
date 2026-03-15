// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _SSI_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ISsiManagement } from "../../facets/layer_1/ssi/ISsiManagement.sol";

struct SsiManagementStorage {
    EnumerableSet.AddressSet issuerList;
    address revocationRegistry;
}

library SsiManagementStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // --- Guard functions ---

    // --- State-changing functions ---

    function setRevocationRegistryAddress(address _revocationRegistryAddress) internal returns (bool success_) {
        ssiManagementStorage().revocationRegistry = _revocationRegistryAddress;
        return true;
    }

    function addIssuer(address _issuer) internal returns (bool success_) {
        success_ = ssiManagementStorage().issuerList.add(_issuer);
    }

    function removeIssuer(address _issuer) internal returns (bool success_) {
        success_ = ssiManagementStorage().issuerList.remove(_issuer);
    }

    // --- Read functions ---

    function getRevocationRegistryAddress() internal view returns (address revocationRegistryAddress_) {
        revocationRegistryAddress_ = ssiManagementStorage().revocationRegistry;
    }

    function getIssuerListCount() internal view returns (uint256 issuerListCount_) {
        issuerListCount_ = ssiManagementStorage().issuerList.length();
    }

    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        return ssiManagementStorage().issuerList.getFromSet(_pageIndex, _pageLength);
    }

    function isIssuer(address _issuer) internal view returns (bool) {
        return ssiManagementStorage().issuerList.contains(_issuer);
    }

    function requireIssuer(address _issuer) internal view {
        if (!isIssuer(_issuer)) revert ISsiManagement.AccountIsNotIssuer(_issuer);
    }

    // --- Storage accessor (pure) ---

    function ssiManagementStorage() internal pure returns (SsiManagementStorage storage ssiManagement_) {
        bytes32 position = _SSI_MANAGEMENT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ssiManagement_.slot := position
        }
    }
}
