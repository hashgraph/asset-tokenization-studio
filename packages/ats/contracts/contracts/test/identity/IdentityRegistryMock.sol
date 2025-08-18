// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract IdentityRegistryMock {
    bool private _isVerified;
    bool private _revert;
    mapping(address => bool) private _verifiedUsers;

    error MockErrorVerified(address _userAddress);

    constructor(bool _isVerifiedFlag, bool _revertFlag) {
        _isVerified = _isVerifiedFlag;
        _revert = _revertFlag;
    }

    function setFlags(bool _isVerifiedFlag, bool _revertFlag) external virtual {
        _isVerified = _isVerifiedFlag;
        _revert = _revertFlag;
    }

    function isVerified(address _userAddress) external view returns (bool) {
        if (_revert) {
            revert MockErrorVerified(_userAddress);
        }
        return _isVerified;
    }
}
