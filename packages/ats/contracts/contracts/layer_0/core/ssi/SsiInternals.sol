// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlInternals } from "../accessControl/AccessControlInternals.sol";

abstract contract SsiInternals is AccessControlInternals {
    function _addAgent(address _agent) internal virtual;
    function _addIssuer(address _issuer) internal virtual returns (bool success_);
    function _removeAgent(address _agent) internal virtual;
    function _removeIssuer(address _issuer) internal virtual returns (bool success_);
    function _setRevocationRegistryAddress(address _revocationRegistryAddress) internal virtual returns (bool success_);
    function _getIssuerListCount() internal view virtual returns (uint256 issuerListCount_);
    function _getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _getRevocationRegistryAddress() internal view virtual returns (address revocationRegistryAddress_);
    function _isIssuer(address _issuer) internal view virtual returns (bool);
}
