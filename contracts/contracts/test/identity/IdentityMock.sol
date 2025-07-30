// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract IdentityMock {

    error MockErrorVerified(address _userAddress);

    uint256 public isVerifiedHit;

    bool private _canTransfer;
    bool private _revert;

    mapping(address => bool) private verifiedUsers;

    constructor(bool _canTransferFlag, bool _revertFlag) {
        _canTransfer = _canTransferFlag;
        _revert = _revertFlag;
    }

    function setFlags(
        bool _canTransferFlag,
        bool _revertFlag
    ) external virtual {
        _canTransfer = _canTransferFlag;
        _revert = _revertFlag;
    }

    function isVerified(
        address _userAddress
    ) external virtual returns (bool) {
        if (_revert) {
            revert MockErrorVerified(_userAddress);
        }
        ++isVerifiedHit;
        return verifiedUsers[_userAddress];
    }

    function canTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external view virtual returns (bool) {
        return _canTransfer;
    }

}
