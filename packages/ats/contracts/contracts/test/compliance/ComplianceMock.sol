// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract ComplianceMock {
    uint256 public transferredHit;
    uint256 public createdHit;
    uint256 public destroyedHit;

    mapping(bytes32 => bool) private _canTransfer;
    mapping(bytes32 => bool) private _revert;

    error MockErrorTransfer(address _from, address _to, uint256 _amount);
    error MockErrorMint(address _to, uint256 _amount);
    error MockErrorBurn(address _from, uint256 _amount);
    error MockErrorCanTransfer(address _from, address _to, uint256 _amount);

    constructor(bool _canTransferFlag, bool _revertFlag) {
        setFlags(_canTransferFlag, _revertFlag);
    }

    function transferred(
        address _from,
        address _to,
        uint256 _amount
    ) external virtual {
        if (_revert[keccak256('transferred')]) {
            revert MockErrorTransfer(_from, _to, _amount);
        }
        ++transferredHit;
    }
    function created(address _to, uint256 _amount) external virtual {
        if (_revert[keccak256('created')]) {
            revert MockErrorMint(_to, _amount);
        }
        ++createdHit;
    }
    function destroyed(address _from, uint256 _amount) external virtual {
        if (_revert[keccak256('destroyed')]) {
            revert MockErrorBurn(_from, _amount);
        }
        ++destroyedHit;
    }

    function canTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external view virtual returns (bool) {
        if (_revert[keccak256('canTransfer')]) {
            revert MockErrorCanTransfer(_from, _to, _amount);
        }
        if (_from != address(0)) {
            if (!_canTransfer[keccak256('from')]) return false;
        }
        if (_to != address(0)) {
            if (!_canTransfer[keccak256('to')]) return false;
        }
        return true;
    }

    function setFlags(bool _canTransferFlag, bool _revertFlag) public virtual {
        _canTransfer[keccak256('from')] = _canTransferFlag;
        _canTransfer[keccak256('to')] = _canTransferFlag;
        _canTransfer[keccak256('sender')] = _canTransferFlag;

        _revert[keccak256('transferred')] = _revertFlag;
        _revert[keccak256('created')] = _revertFlag;
        _revert[keccak256('destroyed')] = _revertFlag;
        _revert[keccak256('canTransfer')] = _revertFlag;
    }

    function setFlagsByMethod(
        bool[] memory _canTransferFlag,
        bytes32[] memory _canTransferKey,
        bool[] memory _revertFlag,
        bytes32[] memory _revertKey
    ) public virtual {
        for (uint256 i; i < _canTransferFlag.length; i++) {
            _canTransfer[_canTransferKey[i]] = _canTransferFlag[i];
        }

        for (uint256 i; i < _revertFlag.length; i++) {
            _revert[_revertKey[i]] = _revertFlag[i];
        }
    }
}
