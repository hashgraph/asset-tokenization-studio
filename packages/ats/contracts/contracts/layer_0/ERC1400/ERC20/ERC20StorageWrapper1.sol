// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC20 } from "../../../layer_1/interfaces/ERC1400/IERC20.sol";
import { IFactory } from "../../../interfaces/factory/IFactory.sol";
import { LockStorageWrapper1 } from "../../lock/LockStorageWrapper1.sol";
import { IERC20StorageWrapper } from "../../../layer_1/interfaces/ERC1400/IERC20StorageWrapper.sol";

abstract contract ERC20StorageWrapper1 is IERC20StorageWrapper, LockStorageWrapper1 {
    struct ERC20Storage {
        string name;
        string symbol;
        string isin;
        uint8 decimals;
        bool initialized;
        mapping(address => mapping(address => uint256)) allowed;
        IFactory.SecurityType securityType;
        uint256 totalSupply;
        mapping(address => uint256) balances;
    }

    function _adjustTotalSupply(uint256 factor) internal {
        _erc20Storage().totalSupply *= factor;
    }

    function _reduceTotalSupply(uint256 amount) internal {
        _erc20Storage().totalSupply -= amount;
    }

    function _increaseTotalSupply(uint256 amount) internal {
        _erc20Storage().totalSupply += amount;
    }

    function _adjustTotalBalanceFor(uint256 abaf, address account) internal {
        uint256 factor = _calculateFactorByAbafAndTokenHolder(abaf, account);
        _erc20Storage().balances[account] *= factor;
        _updateLabafByTokenHolder(abaf, account);
    }

    function _reduceBalanceFor(address account, uint256 amount) internal {
        _erc20Storage().balances[account] -= amount;
        _emitTransferEvent(account, address(0), amount);
    }

    function _increaseBalanceFor(address account, uint256 amount) internal {
        _erc20Storage().balances[account] += amount;
        _emitTransferEvent(address(0), account, amount);
    }

    function _transferBalanceBetween(address from, address to, uint256 amount) internal {
        _erc20Storage().balances[from] -= amount;
        _erc20Storage().balances[to] += amount;
        _emitTransferEvent(from, to, amount);
    }

    function _adjustDecimals(uint8 decimals) internal {
        _erc20Storage().decimals += decimals;
    }

    function _decimalsAdjusted() internal view returns (uint8) {
        return _decimalsAdjustedAt(_blockTimestamp());
    }

    function _allowanceAdjusted(address _owner, address _spender) internal view returns (uint256) {
        return _allowanceAdjustedAt(_owner, _spender, _blockTimestamp());
    }

    function _allowance(address owner, address spender) internal view returns (uint256) {
        return _erc20Storage().allowed[owner][spender];
    }

    function _decimalsAdjustedAt(uint256 _timestamp) internal view returns (uint8) {
        return _getERC20MetadataAdjustedAt(_timestamp).info.decimals;
    }

    function _allowanceAdjustedAt(
        address _owner,
        address _spender,
        uint256 _timestamp
    ) internal view returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(_timestamp), _getAllowanceLabaf(_owner, _spender));
        return _allowance(_owner, _spender) * factor;
    }

    function _getERC20MetadataAdjusted() internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        erc20Metadata_ = _getERC20MetadataAdjustedAt(_blockTimestamp());
    }

    function _getERC20MetadataAdjustedAt(
        uint256 _timestamp
    ) internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        (, uint8 pendingDecimals) = _getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        erc20Metadata_ = _getERC20Metadata();
        erc20Metadata_.info.decimals += pendingDecimals;
    }

    function _getERC20Metadata() internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        ERC20Storage storage erc20Storage = _erc20Storage();
        IERC20.ERC20MetadataInfo memory erc20Info = IERC20.ERC20MetadataInfo({
            name: erc20Storage.name,
            symbol: erc20Storage.symbol,
            isin: erc20Storage.isin,
            decimals: erc20Storage.decimals
        });
        erc20Metadata_ = IERC20.ERC20Metadata({ info: erc20Info, securityType: erc20Storage.securityType });
    }

    function _decimals() internal view returns (uint8) {
        return _erc20Storage().decimals;
    }

    function _totalSupply() internal view returns (uint256) {
        return _erc20Storage().totalSupply;
    }

    function _balanceOf(address _tokenHolder) internal view returns (uint256) {
        return _erc20Storage().balances[_tokenHolder];
    }

    function _erc20Storage() internal pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }

    function _emitTransferEvent(address from, address to, uint256 value) private returns (bool) {
        emit Transfer(from, to, value);
        return true;
    }
}
