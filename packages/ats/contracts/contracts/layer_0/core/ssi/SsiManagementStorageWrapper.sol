// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {LibCommon} from '../../common/libraries/LibCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    AccessControlStorageWrapper
} from '../accessControl/AccessControlStorageWrapper.sol';
import {
    _SSI_MANAGEMENT_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {
    ISsiManagement
} from '../../../layer_1/interfaces/ssi/ISsiManagement.sol';

abstract contract SsiManagementStorageWrapper is AccessControlStorageWrapper {
    using LibCommon for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct SsiManagementStorage {
        EnumerableSet.AddressSet issuerList;
        address revocationRegistry;
    }

    // modifiers
    modifier onlyIssuerListed(address _issuer) {
        _checkIssuer(_issuer);
        _;
    }

    // Internal
    function _setRevocationRegistryAddress(
        address _revocationRegistryAddress
    ) internal returns (bool success_) {
        _ssiManagementStorage().revocationRegistry = _revocationRegistryAddress;
        return true;
    }

    function _addIssuer(address _issuer) internal returns (bool success_) {
        success_ = _ssiManagementStorage().issuerList.add(_issuer);
    }

    function _removeIssuer(address _issuer) internal returns (bool success_) {
        success_ = _ssiManagementStorage().issuerList.remove(_issuer);
    }

    function _getRevocationRegistryAddress()
        internal
        view
        returns (address revocationRegistryAddress_)
    {
        revocationRegistryAddress_ = _ssiManagementStorage().revocationRegistry;
    }

    function _getIssuerListCount()
        internal
        view
        returns (uint256 issuerListCount_)
    {
        issuerListCount_ = _ssiManagementStorage().issuerList.length();
    }

    function _getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        return
            _ssiManagementStorage().issuerList.getFromSet(
                _pageIndex,
                _pageLength
            );
    }

    function _isIssuer(address _issuer) internal view returns (bool) {
        return _ssiManagementStorage().issuerList.contains(_issuer);
    }

    function _ssiManagementStorage()
        internal
        pure
        returns (SsiManagementStorage storage ssiManagement_)
    {
        bytes32 position = _SSI_MANAGEMENT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ssiManagement_.slot := position
        }
    }

    function _checkIssuer(address _issuer) private view {
        if (!_isIssuer(_issuer))
            revert ISsiManagement.AccountIsNotIssuer(_issuer);
    }
}
