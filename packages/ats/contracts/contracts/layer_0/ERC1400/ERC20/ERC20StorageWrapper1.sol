// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC20 } from "../../../layer_1/interfaces/ERC1400/IERC20.sol";
import { IERC20StorageWrapper } from "../../../layer_1/interfaces/ERC1400/IERC20StorageWrapper.sol";
import { ERC1410BasicStorageWrapperRead } from "../ERC1410/ERC1410BasicStorageWrapperRead.sol";
import { IFactory } from "../../../interfaces/factory/IFactory.sol";

abstract contract ERC20StorageWrapper1 is ERC1410BasicStorageWrapperRead {
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

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20(IERC20.ERC20Metadata calldata erc20Metadata) internal override {
        ERC20Storage storage erc20Storage = _erc20Storage();
        erc20Storage.name = erc20Metadata.info.name;
        erc20Storage.symbol = erc20Metadata.info.symbol;
        erc20Storage.isin = erc20Metadata.info.isin;
        erc20Storage.decimals = erc20Metadata.info.decimals;
        erc20Storage.securityType = erc20Metadata.securityType;
        erc20Storage.initialized = true;
    }

    // Override functions
    function _adjustDecimals(uint8 decimals) internal override {
        _erc20Storage().decimals += decimals;
    }

    function _adjustTotalSupply(uint256 factor) internal override {
        _erc20Storage().totalSupply *= factor;
    }

    function _adjustTotalBalanceFor(uint256 abaf, address account) internal override {
        uint256 factor = _calculateFactorByAbafAndTokenHolder(abaf, account);
        uint256 oldBalance = _erc20Storage().balances[account];
        uint256 newBalance = oldBalance * factor;
        if (newBalance != oldBalance) {
            _erc20Storage().balances[account] = newBalance;
            unchecked {
                emit IERC20StorageWrapper.Transfer(address(0), address(0), newBalance - oldBalance);
            }
        }
        _updateLabafByTokenHolder(abaf, account);
    }

    function _increaseBalance(address _to, uint256 _value) internal override {
        _migrateBalanceIfNeeded(_to);
        unchecked {
            _erc20Storage().balances[_to] += _value;
        }
    }

    function _reduceBalance(address _from, uint256 _value) internal override {
        _migrateBalanceIfNeeded(_from);
        unchecked {
            _erc20Storage().balances[_from] -= _value;
        }
    }

    function _increaseTotalSupply(uint256 _value) internal override {
        _migrateTotalSupplyIfNeeded();
        unchecked {
            _erc20Storage().totalSupply += _value;
        }
    }

    function _reduceTotalSupply(uint256 _value) internal override {
        _migrateTotalSupplyIfNeeded();
        unchecked {
            _erc20Storage().totalSupply -= _value;
        }
    }

    // Migration functions - must come before internal view functions
    function _migrateTotalSupplyIfNeeded() internal {
        ERC1410BasicStorageWrapperRead.ERC1410BasicStorage storage $ = _erc1410BasicStorage();
        if ($.DEPRECATED_totalSupply == 0) return;
        _erc20Storage().totalSupply = $.DEPRECATED_totalSupply;
        $.DEPRECATED_totalSupply = 0;
    }

    function _migrateBalanceIfNeeded(address _tokenHolder) internal {
        ERC1410BasicStorageWrapperRead.ERC1410BasicStorage storage $ = _erc1410BasicStorage();
        if ($.DEPRECATED_balances[_tokenHolder] == 0) return;
        _erc20Storage().balances[_tokenHolder] = $.DEPRECATED_balances[_tokenHolder];
        $.DEPRECATED_balances[_tokenHolder] = 0;
    }

    function _totalSupply() internal view override returns (uint256 totalSupply_) {
        totalSupply_ = _erc1410BasicStorage().DEPRECATED_totalSupply;
        return totalSupply_ == 0 ? _erc20Storage().totalSupply : totalSupply_;
    }

    function _balanceOf(address _tokenHolder) internal view override returns (uint256 balance_) {
        balance_ = _erc1410BasicStorage().DEPRECATED_balances[_tokenHolder];
        return balance_ == 0 ? _erc20Storage().balances[_tokenHolder] : balance_;
    }

    function _allowance(address _owner, address _spender) internal view override returns (uint256) {
        return _erc20Storage().allowed[_owner][_spender];
    }

    function _decimalsAdjustedAt(uint256 _timestamp) internal view override returns (uint8) {
        return _getERC20MetadataAdjustedAt(_timestamp).info.decimals;
    }

    function _allowanceAdjustedAt(
        address _owner,
        address _spender,
        uint256 _timestamp
    ) internal view override returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(_timestamp), _getAllowanceLabaf(_owner, _spender));
        return _allowance(_owner, _spender) * factor;
    }

    function _getERC20MetadataAdjustedAt(
        uint256 _timestamp
    ) internal view override returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        (, uint8 pendingDecimals) = _getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        erc20Metadata_ = _getERC20Metadata();
        erc20Metadata_.info.decimals += pendingDecimals;
    }

    function _getERC20Metadata() internal view override returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        ERC20Storage storage erc20Storage = _erc20Storage();
        IERC20.ERC20MetadataInfo memory erc20Info = IERC20.ERC20MetadataInfo({
            name: erc20Storage.name,
            symbol: erc20Storage.symbol,
            isin: erc20Storage.isin,
            decimals: erc20Storage.decimals
        });
        erc20Metadata_ = IERC20.ERC20Metadata({ info: erc20Info, securityType: erc20Storage.securityType });
    }

    function _getName() internal view override returns (string memory) {
        return _erc20Storage().name;
    }

    function _decimals() internal view override returns (uint8) {
        return _erc20Storage().decimals;
    }

    function _isERC20Initialized() internal view override returns (bool) {
        return _erc20Storage().initialized;
    }

    function _erc20Storage() internal pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
