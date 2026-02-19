// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KYC_ROLE, _INTERNAL_KYC_MANAGER_ROLE } from "../../../constants/roles.sol";
import { IKyc } from "../interfaces/kyc/IKyc.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { LibKyc } from "../../../lib/core/LibKyc.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibSSI } from "../../../lib/core/LibSSI.sol";

abstract contract KycFacetBase is IKyc, IStaticFunctionSelectors {
    error AlreadyInitialized();
    error InvalidAddress();

    function initializeInternalKyc(bool _internalKycActivated) external {
        if (LibKyc.isKycInitialized()) revert AlreadyInitialized();
        LibKyc.initializeInternalKyc(_internalKycActivated);
    }

    function activateInternalKyc() external returns (bool success_) {
        LibAccess.checkRole(_INTERNAL_KYC_MANAGER_ROLE);
        LibPause.requireNotPaused();
        success_ = LibKyc.setInternalKyc(true);
        emit InternalKycStatusUpdated(msg.sender, true);
    }

    function deactivateInternalKyc() external returns (bool success_) {
        LibAccess.checkRole(_INTERNAL_KYC_MANAGER_ROLE);
        LibPause.requireNotPaused();
        success_ = LibKyc.setInternalKyc(false);
        emit InternalKycStatusUpdated(msg.sender, false);
    }

    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) external returns (bool success_) {
        LibAccess.checkRole(_KYC_ROLE);
        LibPause.requireNotPaused();
        if (_account == address(0)) revert InvalidAddress();
        LibKyc.requireValidKycStatus(IKyc.KycStatus.NOT_GRANTED, _account);
        LibKyc.requireValidDates(_validFrom, _validTo);
        LibSSI.requireIssuer(_issuer);

        success_ = LibKyc.grantKyc(_account, _vcId, _validFrom, _validTo, _issuer);
        emit KycGranted(_account, msg.sender);
    }

    function revokeKyc(address _account) external returns (bool success_) {
        LibAccess.checkRole(_KYC_ROLE);
        LibPause.requireNotPaused();
        if (_account == address(0)) revert InvalidAddress();

        success_ = LibKyc.revokeKyc(_account);
        emit KycRevoked(_account, msg.sender);
    }

    function getKycStatusFor(address _account) external view returns (KycStatus kycStatus_) {
        kycStatus_ = LibKyc.getKycStatusFor(_account);
    }

    function getKycFor(address _account) external view returns (KycData memory kyc_) {
        kyc_ = LibKyc.getKycFor(_account);
    }

    function getKycAccountsCount(KycStatus _kycStatus) external view returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = LibKyc.getKycAccountsCount(_kycStatus);
    }

    function getKycAccountsData(
        KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory accounts_, KycData[] memory kycData_) {
        (accounts_, kycData_) = LibKyc.getKycAccountsData(_kycStatus, _pageIndex, _pageLength);
    }

    function isInternalKycActivated() external view returns (bool) {
        return LibKyc.isInternalKycActivated();
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](10);
        staticFunctionSelectors_[selectorIndex++] = this.initializeInternalKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.activateInternalKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.deactivateInternalKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.grantKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getKycFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getKycStatusFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getKycAccountsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getKycAccountsData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isInternalKycActivated.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IKyc).interfaceId;
    }
}
