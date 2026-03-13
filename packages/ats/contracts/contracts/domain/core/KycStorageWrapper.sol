// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import { IRevocationList } from "../../facets/layer_1/kyc/IRevocationList.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { SsiManagementStorageWrapper } from "./SsiManagementStorageWrapper.sol";
import { _KYC_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

struct KycStorage {
    mapping(address => IKyc.KycData) kyc;
    mapping(IKyc.KycStatus => EnumerableSet.AddressSet) kycAddressesByStatus;
    bool initialized;
    bool internalKycActivated;
}

library KycStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // --- Storage accessor (pure) ---

    function _kycStorage() internal pure returns (KycStorage storage kyc_) {
        bytes32 position = _KYC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kyc_.slot := position
        }
    }

    // --- Guard functions ---

    // solhint-disable-next-line ordering
    function _requireValidKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view {
        if (!_verifyKycStatus(_kycStatus, _account)) revert IKyc.InvalidKycStatus();
    }

    // --- Initialization ---

    function _initializeInternalKyc(bool _internalKycActivated) internal {
        KycStorage storage ks = _kycStorage();
        ks.initialized = true;
        ks.internalKycActivated = _internalKycActivated;
    }

    function _setInternalKyc(bool _activated) internal returns (bool success_) {
        _kycStorage().internalKycActivated = _activated;
        success_ = true;
    }

    // --- State-changing functions ---

    function _grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) internal returns (bool success_) {
        _kycStorage().kyc[_account] = IKyc.KycData(_validFrom, _validTo, _vcId, _issuer, IKyc.KycStatus.GRANTED);
        _kycStorage().kycAddressesByStatus[IKyc.KycStatus.GRANTED].add(_account);
        success_ = true;
    }

    function _revokeKyc(address _account) internal returns (bool success_) {
        delete _kycStorage().kyc[_account];
        _kycStorage().kycAddressesByStatus[IKyc.KycStatus.GRANTED].remove(_account);
        success_ = true;
    }

    // --- Read functions ---

    function _getKycStatusFor(address _account, uint256 _timestamp) internal view returns (IKyc.KycStatus) {
        IKyc.KycData memory kycFor = _getKycFor(_account);

        if (kycFor.validTo < _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (kycFor.validFrom > _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (!SsiManagementStorageWrapper._isIssuer(kycFor.issuer)) return IKyc.KycStatus.NOT_GRANTED;

        address revocationListAddress = SsiManagementStorageWrapper._getRevocationRegistryAddress();

        if (
            revocationListAddress != address(0) &&
            IRevocationList(revocationListAddress).revoked(kycFor.issuer, kycFor.vcId)
        ) return IKyc.KycStatus.NOT_GRANTED;

        return kycFor.status;
    }

    function _getKycFor(address _account) internal view returns (IKyc.KycData memory) {
        return _kycStorage().kyc[_account];
    }

    function _getKycAccountsCount(IKyc.KycStatus _kycStatus) internal view returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = _kycStorage().kycAddressesByStatus[_kycStatus].length();
    }

    function _getKycAccountsData(
        IKyc.KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory accounts_, IKyc.KycData[] memory kycData_) {
        accounts_ = _kycStorage().kycAddressesByStatus[_kycStatus].getFromSet(_pageIndex, _pageLength);

        uint256 totalAccounts = accounts_.length;
        kycData_ = new IKyc.KycData[](totalAccounts);

        for (uint256 index; index < totalAccounts; ) {
            kycData_[index] = _getKycFor(accounts_[index]);
            unchecked {
                ++index;
            }
        }
    }

    function _verifyKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view returns (bool) {
        KycStorage storage ks = _kycStorage();
        bool internalKycValid = !ks.internalKycActivated || _getKycStatusFor(_account, block.timestamp) == _kycStatus;
        return internalKycValid && ExternalListManagementStorageWrapper._isExternallyGranted(_account, _kycStatus);
    }

    function _isInternalKycActivated() internal view returns (bool) {
        return _kycStorage().internalKycActivated;
    }

    function _isKycInitialized() internal view returns (bool) {
        return _kycStorage().initialized;
    }

    function _requireValidDates(uint256 _validFrom, uint256 _validTo, uint256 _timestamp) internal pure {
        if (_validFrom > _validTo || _validTo < _timestamp) revert IKyc.InvalidDates();
    }
}
