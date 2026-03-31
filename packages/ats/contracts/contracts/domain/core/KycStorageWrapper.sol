// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import { IRevocationList } from "../../facets/layer_1/kyc/IRevocationList.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { SsiManagementStorageWrapper } from "./SsiManagementStorageWrapper.sol";
import { _KYC_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

struct KycStorage {
    mapping(address => IKyc.KycData) kyc;
    mapping(IKyc.KycStatus => EnumerableSet.AddressSet) kycAddressesByStatus;
    bool initialized;
    bool internalKycActivated;
}

library KycStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // --- Initialization ---

    function initializeInternalKyc(bool _internalKycActivated) internal {
        KycStorage storage ks = kycStorage();
        ks.initialized = true;
        ks.internalKycActivated = _internalKycActivated;
    }

    // --- State-changing functions ---

    function setInternalKyc(bool _activated) internal returns (bool success_) {
        kycStorage().internalKycActivated = _activated;
        success_ = true;
    }

    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) internal returns (bool success_) {
        kycStorage().kyc[_account] = IKyc.KycData(_validFrom, _validTo, _vcId, _issuer, IKyc.KycStatus.GRANTED);
        kycStorage().kycAddressesByStatus[IKyc.KycStatus.GRANTED].add(_account);
        success_ = true;
    }

    function revokeKyc(address _account) internal returns (bool success_) {
        delete kycStorage().kyc[_account];
        kycStorage().kycAddressesByStatus[IKyc.KycStatus.GRANTED].remove(_account);
        success_ = true;
    }

    // --- Guard functions ---

    function requireValidKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view {
        if (!verifyKycStatus(_kycStatus, _account)) revert IKyc.InvalidKycStatus();
    }

    // --- Read functions ---

    function getKycStatusFor(address _account, uint256 _timestamp) internal view returns (IKyc.KycStatus) {
        IKyc.KycData memory kycFor = getKycFor(_account);

        if (kycFor.validTo < _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (kycFor.validFrom > _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (!SsiManagementStorageWrapper.isIssuer(kycFor.issuer)) return IKyc.KycStatus.NOT_GRANTED;

        address revocationListAddress = SsiManagementStorageWrapper.getRevocationRegistryAddress();

        if (
            revocationListAddress != address(0) &&
            IRevocationList(revocationListAddress).revoked(kycFor.issuer, kycFor.vcId)
        ) return IKyc.KycStatus.NOT_GRANTED;

        return kycFor.status;
    }

    function getKycFor(address _account) internal view returns (IKyc.KycData memory) {
        return kycStorage().kyc[_account];
    }

    function getKycAccountsCount(IKyc.KycStatus _kycStatus) internal view returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = kycStorage().kycAddressesByStatus[_kycStatus].length();
    }

    function getKycAccountsData(
        IKyc.KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory accounts_, IKyc.KycData[] memory kycData_) {
        accounts_ = kycStorage().kycAddressesByStatus[_kycStatus].getFromSet(_pageIndex, _pageLength);

        uint256 totalAccounts = accounts_.length;
        kycData_ = new IKyc.KycData[](totalAccounts);

        for (uint256 index; index < totalAccounts; ) {
            kycData_[index] = getKycFor(accounts_[index]);
            unchecked {
                ++index;
            }
        }
    }

    function verifyKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view returns (bool) {
        KycStorage storage ks = kycStorage();
        bool internalKycValid = !ks.internalKycActivated ||
            getKycStatusFor(_account, TimeTravelStorageWrapper.getBlockTimestamp()) == _kycStatus;
        return internalKycValid && ExternalListManagementStorageWrapper.isExternallyGranted(_account, _kycStatus);
    }

    function isInternalKycActivated() internal view returns (bool) {
        return kycStorage().internalKycActivated;
    }

    function isKycInitialized() internal view returns (bool) {
        return kycStorage().initialized;
    }

    // --- Pure functions ---

    function requireValidDates(uint256 _validFrom, uint256 _validTo, uint256 _timestamp) internal pure {
        if (_validFrom > _validTo || _validTo < _timestamp) revert IKyc.InvalidDates();
    }

    function kycStorage() internal pure returns (KycStorage storage kyc_) {
        bytes32 position = _KYC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kyc_.slot := position
        }
    }
}
