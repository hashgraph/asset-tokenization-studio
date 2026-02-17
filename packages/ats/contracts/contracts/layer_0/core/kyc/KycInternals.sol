// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalKycListInternals } from "../externalKycLists/ExternalKycListInternals.sol";
import { IKyc } from "../../../layer_1/interfaces/kyc/IKyc.sol";

abstract contract KycInternals is ExternalKycListInternals {
    function _grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) internal virtual returns (bool success_);
    // solhint-disable-next-line func-name-mixedcase
    function _initializeInternalKyc(bool _internalKycActivated) internal virtual;
    function _revokeKyc(address _account) internal virtual returns (bool success_);
    function _setInternalKyc(bool _activated) internal virtual returns (bool success_);
    function _checkValidKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view virtual;
    function _getKycAccountsCount(IKyc.KycStatus _kycStatus) internal view virtual returns (uint256 kycAccountsCount_);
    function _getKycAccountsData(
        IKyc.KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory accounts_, IKyc.KycData[] memory kycData_);
    function _getKycFor(address _account) internal view virtual returns (IKyc.KycData memory);
    function _getKycStatusFor(address _account) internal view virtual returns (IKyc.KycStatus kycStatus_);
    function _isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) internal view virtual returns (bool);
    function _isInternalKycActivated() internal view virtual returns (bool);
    function _isKycInitialized() internal view virtual returns (bool);
    function _verifyKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view virtual returns (bool);
}
