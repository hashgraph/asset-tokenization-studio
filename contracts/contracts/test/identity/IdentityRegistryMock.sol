// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract IdentityRegistryMock {

    error MockErrorVerified(address _userAddress);

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
    ) external view returns (bool) {
        if (_revert) {
            revert MockErrorVerified(_userAddress);
        }
        return verifiedUsers[_userAddress];
    }

    function canTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external view virtual returns (bool) {
        return _canTransfer;
    }

    function setVerified(address _user, bool _verified) external {
        verifiedUsers[_user] = _verified;
    }

}
