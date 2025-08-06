// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract ComplianceMock {
    error MockErrorTransfer(address _from, address _to, uint256 _amount);
    error MockErrorMint(address _to, uint256 _amount);
    error MockErrorBurn(address _from, uint256 _amount);
    error MockErrorCanTransfer(address _from, address _to, uint256 _amount);

    uint256 public transferredHit;
    uint256 public createdHit;
    uint256 public destroyedHit;

    bool private _canTransfer;
    bool private _revert;

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

    function transferred(
        address _from,
        address _to,
        uint256 _amount
    ) external virtual {
        if (_revert) {
            revert MockErrorTransfer(_from, _to, _amount);
        }
        ++transferredHit;
    }
    function created(address _to, uint256 _amount) external virtual {
        if (_revert) {
            revert MockErrorMint(_to, _amount);
        }
        ++createdHit;
    }
    function destroyed(address _from, uint256 _amount) external virtual {
        if (_revert) {
            revert MockErrorBurn(_from, _amount);
        }
        ++destroyedHit;
    }

    function canTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external view virtual returns (bool) {
        if (_revert) {
            revert MockErrorCanTransfer(_from, _to, _amount);
        }
        return _canTransfer;
    }
}
