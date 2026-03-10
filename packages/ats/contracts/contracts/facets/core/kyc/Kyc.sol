// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KYC_ROLE, _INTERNAL_KYC_MANAGER_ROLE } from "../../../constants/roles.sol";
import { IKyc } from "../kyc/IKyc.sol";
import { KycStorageWrapper } from "../../../domain/core/KycStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { SSIStorageWrapper } from "../../../domain/core/SSIStorageWrapper.sol";

abstract contract Kyc is IKyc {
    error AlreadyInitialized();
    error InvalidAddress();

    function initializeInternalKyc(bool _internalKycActivated) external {
        if (KycStorageWrapper.isKycInitialized()) revert AlreadyInitialized();
        KycStorageWrapper.initializeInternalKyc(_internalKycActivated);
    }

    function activateInternalKyc() external returns (bool success_) {
        AccessStorageWrapper.checkRole(_INTERNAL_KYC_MANAGER_ROLE);
        PauseStorageWrapper.requireNotPaused();
        success_ = KycStorageWrapper.setInternalKyc(true);
        emit InternalKycStatusUpdated(msg.sender, true);
    }

    function deactivateInternalKyc() external returns (bool success_) {
        AccessStorageWrapper.checkRole(_INTERNAL_KYC_MANAGER_ROLE);
        PauseStorageWrapper.requireNotPaused();
        success_ = KycStorageWrapper.setInternalKyc(false);
        emit InternalKycStatusUpdated(msg.sender, false);
    }

    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) external returns (bool success_) {
        AccessStorageWrapper.checkRole(_KYC_ROLE);
        PauseStorageWrapper.requireNotPaused();
        if (_account == address(0)) revert InvalidAddress();
        KycStorageWrapper.requireValidKycStatus(IKyc.KycStatus.NOT_GRANTED, _account);
        KycStorageWrapper.requireValidDates(_validFrom, _validTo);
        SSIStorageWrapper.requireIssuer(_issuer);

        success_ = KycStorageWrapper.grantKyc(_account, _vcId, _validFrom, _validTo, _issuer);
        emit KycGranted(_account, msg.sender);
    }

    function revokeKyc(address _account) external returns (bool success_) {
        AccessStorageWrapper.checkRole(_KYC_ROLE);
        PauseStorageWrapper.requireNotPaused();
        if (_account == address(0)) revert InvalidAddress();

        success_ = KycStorageWrapper.revokeKyc(_account);
        emit KycRevoked(_account, msg.sender);
    }

    function getKycStatusFor(address _account) external view returns (KycStatus kycStatus_) {
        kycStatus_ = KycStorageWrapper.getKycStatusFor(_account);
    }

    function getKycFor(address _account) external view returns (KycData memory kyc_) {
        kyc_ = KycStorageWrapper.getKycFor(_account);
    }

    function getKycAccountsCount(KycStatus _kycStatus) external view returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = KycStorageWrapper.getKycAccountsCount(_kycStatus);
    }

    function getKycAccountsData(
        KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory accounts_, KycData[] memory kycData_) {
        (accounts_, kycData_) = KycStorageWrapper.getKycAccountsData(_kycStatus, _pageIndex, _pageLength);
    }

    function isInternalKycActivated() external view returns (bool) {
        return KycStorageWrapper.isInternalKycActivated();
    }
}
