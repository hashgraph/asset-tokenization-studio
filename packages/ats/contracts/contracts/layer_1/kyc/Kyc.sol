// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KYC_ROLE, _INTERNAL_KYC_MANAGER_ROLE } from "../constants/roles.sol";
import { IKyc } from "../interfaces/kyc/IKyc.sol";
import { Common } from "../common/Common.sol";

abstract contract Kyc is IKyc, Common {
    function initializeInternalKyc(bool _internalKycActivated) external onlyUninitialized(_kycStorage().initialized) {
        KycStorage storage kycStorage = _kycStorage();
        kycStorage.initialized = true;
        kycStorage.internalKycActivated = _internalKycActivated;
    }

    function activateInternalKyc() external onlyRole(_INTERNAL_KYC_MANAGER_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _setInternalKyc(true);
        emit InternalKycStatusUpdated(_msgSender(), true);
    }

    function deactivateInternalKyc()
        external
        onlyRole(_INTERNAL_KYC_MANAGER_ROLE)
        onlyUnpaused
        returns (bool success_)
    {
        success_ = _setInternalKyc(false);
        emit InternalKycStatusUpdated(_msgSender(), false);
    }

    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    )
        external
        virtual
        override
        onlyRole(_KYC_ROLE)
        onlyUnpaused
        validateAddress(_account)
        onlyValidKycStatus(KycStatus.NOT_GRANTED, _account)
        onlyValidDates(_validFrom, _validTo)
        onlyIssuerListed(_issuer)
        returns (bool success_)
    {
        success_ = _grantKyc(_account, _vcId, _validFrom, _validTo, _issuer);
        emit KycGranted(_account, _msgSender());
    }

    function revokeKyc(
        address _account
    ) external virtual override onlyRole(_KYC_ROLE) onlyUnpaused validateAddress(_account) returns (bool success_) {
        success_ = _revokeKyc(_account);
        emit KycRevoked(_account, _msgSender());
    }

    function getKycStatusFor(address _account) external view virtual override returns (KycStatus kycStatus_) {
        kycStatus_ = _getKycStatusFor(_account);
    }

    function getKycFor(address _account) external view virtual override returns (KycData memory kyc_) {
        kyc_ = _getKycFor(_account);
    }

    function getKycAccountsCount(
        KycStatus _kycStatus
    ) external view virtual override returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = _getKycAccountsCount(_kycStatus);
    }

    function getKycAccountsData(
        KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (address[] memory accounts_, KycData[] memory kycData_) {
        (accounts_, kycData_) = _getKycAccountsData(_kycStatus, _pageIndex, _pageLength);
    }

    function isInternalKycActivated() external view virtual override returns (bool) {
        return _isInternalKycActivated();
    }
}
