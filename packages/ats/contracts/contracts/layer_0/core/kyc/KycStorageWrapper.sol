// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../../../layer_1/interfaces/kyc/IKyc.sol";
import {
    ExternalKycListManagementStorageWrapper
} from "../externalKycLists/ExternalKycListManagementStorageWrapper.sol";
import { _KYC_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { LibCommon } from "../../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IRevocationList } from "../../../layer_1/interfaces/kyc/IRevocationList.sol";

abstract contract KycStorageWrapper is ExternalKycListManagementStorageWrapper {
    using LibCommon for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct KycStorage {
        mapping(address => IKyc.KycData) kyc;
        mapping(IKyc.KycStatus => EnumerableSet.AddressSet) kycAddressesByStatus;
        bool initialized;
        bool internalKycActivated;
    }

    modifier onlyValidDates(uint256 _validFrom, uint256 _validTo) override {
        _checkValidDates(_validFrom, _validTo);
        _;
    }

    modifier onlyValidKycStatus(IKyc.KycStatus _kycStatus, address _account) override {
        _checkValidKycStatus(_kycStatus, _account);
        _;
    }

    function _setInternalKyc(bool _activated) internal returns (bool success_) {
        _kycStorage().internalKycActivated = _activated;
        success_ = true;
    }

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

    function _getKycStatusFor(address _account) internal view virtual returns (IKyc.KycStatus kycStatus_) {
        IKyc.KycData memory kycFor = _getKycFor(_account);

        if (kycFor.validTo < _blockTimestamp()) return IKyc.KycStatus.NOT_GRANTED;
        if (kycFor.validFrom > _blockTimestamp()) return IKyc.KycStatus.NOT_GRANTED;
        if (!_isIssuer(kycFor.issuer)) return IKyc.KycStatus.NOT_GRANTED;

        address revocationListAddress = _getRevocationRegistryAddress();

        if (
            revocationListAddress != address(0) &&
            IRevocationList(revocationListAddress).revoked(kycFor.issuer, kycFor.vcId)
        ) return IKyc.KycStatus.NOT_GRANTED;

        if (revocationListAddress != address(0)) {
            if (IRevocationList(revocationListAddress).revoked(kycFor.issuer, kycFor.vcId))
                return IKyc.KycStatus.NOT_GRANTED;
        }
        return kycFor.status;
    }

    function _getKycFor(address _account) internal view virtual returns (IKyc.KycData memory) {
        return _kycStorage().kyc[_account];
    }

    function _getKycAccountsCount(IKyc.KycStatus _kycStatus) internal view virtual returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = _kycStorage().kycAddressesByStatus[_kycStatus].length();
    }

    function _getKycAccountsData(
        IKyc.KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory accounts_, IKyc.KycData[] memory kycData_) {
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

    function _verifyKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view virtual returns (bool) {
        KycStorage storage kycStorage = _kycStorage();

        bool internalKycValid = !kycStorage.internalKycActivated || _getKycStatusFor(_account) == _kycStatus;
        return internalKycValid && _isExternallyGranted(_account, _kycStatus);
    }

    function _checkValidKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view {
        if (!_verifyKycStatus(_kycStatus, _account)) revert IKyc.InvalidKycStatus();
    }

    function _isInternalKycActivated() internal view returns (bool) {
        return _kycStorage().internalKycActivated;
    }

    function _kycStorage() internal pure returns (KycStorage storage kyc_) {
        bytes32 position = _KYC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kyc_.slot := position
        }
    }

    function _checkValidDates(uint256 _validFrom, uint256 _validTo) private view {
        if (_validFrom > _validTo || _validTo < _blockTimestamp()) revert IKyc.InvalidDates();
    }
}
