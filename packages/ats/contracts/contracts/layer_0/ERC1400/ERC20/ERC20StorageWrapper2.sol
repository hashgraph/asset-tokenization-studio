// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../layer_0/constants/values.sol";
import { IERC20StorageWrapper } from "../../../layer_1/interfaces/ERC1400/IERC20StorageWrapper.sol";
import { BasicTransferInfo, IssueData } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { ERC1410StandardStorageWrapper } from "../ERC1410/ERC1410StandardStorageWrapper.sol";

abstract contract ERC20StorageWrapper2 is IERC20StorageWrapper, ERC1410StandardStorageWrapper {
    function _beforeAllowanceUpdate(address _owner, address _spender) internal {
        _triggerAndSyncAll(_DEFAULT_PARTITION, _owner, address(0));

        _updateAllowanceAndLabaf(_owner, _spender);
    }

    function _updateAllowanceAndLabaf(address _owner, address _spender) internal {
        uint256 abaf = _getAbaf();
        uint256 labaf = _getAllowanceLabaf(_owner, _spender);

        if (abaf == labaf) return;

        uint256 factor = _calculateFactor(abaf, labaf);

        _erc20Storage().allowed[_owner][_spender] *= factor;
        _updateAllowanceLabaf(_owner, _spender, abaf);
    }

    function _approve(address owner, address spender, uint256 value) internal returns (bool) {
        if (owner == address(0)) {
            revert ZeroOwnerAddress();
        }
        if (spender == address(0)) {
            revert SpenderWithZeroAddress();
        }

        _erc20Storage().allowed[owner][spender] = value;
        emit Approval(owner, spender, value);
        return true;
    }

    function _increaseAllowance(address spender, uint256 addedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert SpenderWithZeroAddress();
        }

        _increaseAllowedBalance(_msgSender(), spender, addedValue);

        return true;
    }

    function _decreaseAllowance(address spender, uint256 subtractedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert SpenderWithZeroAddress();
        }
        _decreaseAllowedBalance(_msgSender(), spender, subtractedValue);
        emit Approval(_msgSender(), spender, _erc20Storage().allowed[_msgSender()][spender]);
        return true;
    }

    function _transferFrom(address spender, address from, address to, uint256 value) internal returns (bool) {
        _decreaseAllowedBalance(from, spender, value);
        _transferByPartition(from, BasicTransferInfo(to, value), _DEFAULT_PARTITION, "", spender, "");
        return _emitTransferEvent(from, to, value);
    }

    function _transfer(address from, address to, uint256 value) internal returns (bool) {
        _transferByPartition(from, BasicTransferInfo(to, value), _DEFAULT_PARTITION, "", address(0), "");
        return _emitTransferEvent(from, to, value);
    }

    function _mint(address to, uint256 value) internal {
        _issueByPartition(IssueData(_DEFAULT_PARTITION, to, value, ""));
        _emitTransferEvent(address(0), to, value);
    }

    function _burn(address from, uint256 value) internal {
        _redeemByPartition(_DEFAULT_PARTITION, from, address(0), value, "", "");
        _emitTransferEvent(from, address(0), value);
    }

    function _burnFrom(address account, uint256 value) internal {
        _decreaseAllowedBalance(account, _msgSender(), value);
        _burn(account, value);
    }

    function _decreaseAllowedBalance(address from, address spender, uint256 value) internal {
        _beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Storage = _erc20Storage();

        if (value > erc20Storage.allowed[from][spender]) {
            revert InsufficientAllowance(spender, from);
        }

        erc20Storage.allowed[from][spender] -= value;
    }

    function _increaseAllowedBalance(address from, address spender, uint256 value) internal {
        _beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Storage = _erc20Storage();

        erc20Storage.allowed[from][spender] += value;

        emit Approval(from, spender, _erc20Storage().allowed[from][spender]);
    }

    function _emitTransferEvent(address from, address to, uint256 value) private returns (bool) {
        emit Transfer(from, to, value);
        return true;
    }
}
