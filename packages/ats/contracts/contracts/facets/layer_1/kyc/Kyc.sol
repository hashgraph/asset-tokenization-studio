// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KYC_ROLE, _INTERNAL_KYC_MANAGER_ROLE } from "../../../constants/roles.sol";
import { IKyc } from "./IKyc.sol";
import { AccessControlModifiers } from "../../../infrastructure/utils/AccessControlModifiers.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { KycStorageWrapper } from "../../../domain/core/KycStorageWrapper.sol";
import { SsiManagementStorageWrapper } from "../../../domain/core/SsiManagementStorageWrapper.sol";
import { _checkNotInitialized } from "../../../services/InitializationErrors.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract Kyc is IKyc, AccessControlModifiers, TimestampProvider, PauseModifiers {
    function initializeInternalKyc(bool _internalKycActivated) external {
        _checkNotInitialized(KycStorageWrapper.isKycInitialized());
        KycStorageWrapper.initializeInternalKyc(_internalKycActivated);
    }

    function activateInternalKyc() external onlyUnpaused onlyRole(_INTERNAL_KYC_MANAGER_ROLE) returns (bool success_) {
        success_ = KycStorageWrapper.setInternalKyc(true);
        emit InternalKycStatusUpdated(msg.sender, true);
    }

    function deactivateInternalKyc()
        external
        onlyUnpaused
        onlyRole(_INTERNAL_KYC_MANAGER_ROLE)
        returns (bool success_)
    {
        success_ = KycStorageWrapper.setInternalKyc(false);
        emit InternalKycStatusUpdated(msg.sender, false);
    }

    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) external virtual override onlyUnpaused onlyRole(_KYC_ROLE) returns (bool success_) {
        ERC1410StorageWrapper.requireValidAddress(_account);
        KycStorageWrapper.requireValidKycStatus(KycStatus.NOT_GRANTED, _account);
        KycStorageWrapper.requireValidDates(_validFrom, _validTo, _getBlockTimestamp());
        SsiManagementStorageWrapper.requireIssuer(_issuer);
        success_ = KycStorageWrapper.grantKyc(_account, _vcId, _validFrom, _validTo, _issuer);
        emit KycGranted(_account, msg.sender);
    }

    function revokeKyc(
        address _account
    ) external virtual override onlyUnpaused onlyRole(_KYC_ROLE) returns (bool success_) {
        ERC1410StorageWrapper.requireValidAddress(_account);
        success_ = KycStorageWrapper.revokeKyc(_account);
        emit KycRevoked(_account, msg.sender);
    }

    function getKycStatusFor(address _account) external view virtual override returns (KycStatus kycStatus_) {
        kycStatus_ = KycStorageWrapper.getKycStatusFor(_account, _getBlockTimestamp());
    }

    function getKycFor(address _account) external view virtual override returns (KycData memory kyc_) {
        kyc_ = KycStorageWrapper.getKycFor(_account);
    }

    function getKycAccountsCount(
        KycStatus _kycStatus
    ) external view virtual override returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = KycStorageWrapper.getKycAccountsCount(_kycStatus);
    }

    function getKycAccountsData(
        KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (address[] memory accounts_, KycData[] memory kycData_) {
        (accounts_, kycData_) = KycStorageWrapper.getKycAccountsData(_kycStatus, _pageIndex, _pageLength);
    }

    function isInternalKycActivated() external view virtual override returns (bool) {
        return KycStorageWrapper.isInternalKycActivated();
    }
}
