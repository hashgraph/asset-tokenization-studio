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

    // --- Storage accessor (pure) ---

    function _ssiManagementStorage() internal pure returns (SsiManagementStorage storage ssiManagement_) {
        bytes32 position = _SSI_MANAGEMENT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ssiManagement_.slot := position
        }
    }

    // --- Guard functions ---

    // --- State-changing functions ---

    // solhint-disable-next-line ordering
    function _setRevocationRegistryAddress(address _revocationRegistryAddress) internal returns (bool success_) {
        _ssiManagementStorage().revocationRegistry = _revocationRegistryAddress;
        return true;
    }

    function _addIssuer(address _issuer) internal returns (bool success_) {
        success_ = _ssiManagementStorage().issuerList.add(_issuer);
    }

    function _removeIssuer(address _issuer) internal returns (bool success_) {
        success_ = _ssiManagementStorage().issuerList.remove(_issuer);
    }

    // --- Read functions ---

    function _getRevocationRegistryAddress() internal view returns (address revocationRegistryAddress_) {
        revocationRegistryAddress_ = _ssiManagementStorage().revocationRegistry;
    }

    function _getIssuerListCount() internal view returns (uint256 issuerListCount_) {
        issuerListCount_ = _ssiManagementStorage().issuerList.length();
    }

    function _getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        return _ssiManagementStorage().issuerList.getFromSet(_pageIndex, _pageLength);
    }

    function _isIssuer(address _issuer) internal view returns (bool) {
        return _ssiManagementStorage().issuerList.contains(_issuer);
    }

    function _requireIssuer(address _issuer) internal view {
        if (!_isIssuer(_issuer)) revert ISsiManagement.AccountIsNotIssuer(_issuer);
    }
}
