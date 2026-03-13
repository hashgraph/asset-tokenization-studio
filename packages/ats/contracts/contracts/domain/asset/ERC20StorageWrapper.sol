// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IERC20StorageWrapper } from "./ERC1400/ERC20/IERC20StorageWrapper.sol";
import { BasicTransferInfo, IssueData } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410.sol";
import { IFactory } from "../../factory/IFactory.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";

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

library ERC20StorageWrapper {
    function _erc20Storage() internal pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }

    // --- Initialization ---

    // solhint-disable-next-line ordering
    function _initializeERC20(IERC20.ERC20Metadata calldata erc20Metadata) internal {
        ERC20Storage storage erc20Stor = _erc20Storage();
        erc20Stor.name = erc20Metadata.info.name;
        erc20Stor.symbol = erc20Metadata.info.symbol;
        erc20Stor.isin = erc20Metadata.info.isin;
        erc20Stor.decimals = erc20Metadata.info.decimals;
        erc20Stor.securityType = erc20Metadata.securityType;
        erc20Stor.initialized = true;
    }

    // --- Balance operations ---

    function _increaseBalance(address to, uint256 value) internal {
        _migrateBalanceIfNeeded(to);
        unchecked {
            _erc20Storage().balances[to] += value;
        }
    }

    function _reduceBalance(address from, uint256 value) internal {
        _migrateBalanceIfNeeded(from);
        unchecked {
            _erc20Storage().balances[from] -= value;
        }
    }

    // --- Total supply operations ---

    function _increaseTotalSupply(uint256 value) internal {
        _migrateTotalSupplyIfNeeded();
        unchecked {
            _erc20Storage().totalSupply += value;
        }
    }

    function _reduceTotalSupply(uint256 value) internal {
        _migrateTotalSupplyIfNeeded();
        unchecked {
            _erc20Storage().totalSupply -= value;
        }
    }

    function _adjustTotalSupply(uint256 factor) internal {
        _migrateTotalSupplyIfNeeded();
        _erc20Storage().totalSupply *= factor;
    }

    function _adjustDecimals(uint8 decimals) internal {
        _erc20Storage().decimals += decimals;
    }

    // --- Balance adjustments ---

    function _adjustTotalBalanceFor(uint256 abaf, address account) internal {
        _migrateBalanceIfNeeded(account);
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactorByAbafAndTokenHolder(abaf, account);
        uint256 oldBalance = _erc20Storage().balances[account];
        uint256 newBalance = oldBalance * factor;
        if (newBalance != oldBalance) {
            _erc20Storage().balances[account] = newBalance;
            unchecked {
                emit IERC20StorageWrapper.Transfer(address(0), address(0), newBalance - oldBalance);
            }
        }
        AdjustBalancesStorageWrapper._updateLabafByTokenHolder(abaf, account);
    }

    // --- Migration functions ---

    function _migrateTotalSupplyIfNeeded() internal {
        ERC1410StorageWrapper.ERC1410BasicStorage storage $ = ERC1410StorageWrapper._erc1410BasicStorage();
        if ($.DEPRECATED_totalSupply == 0) return;
        _erc20Storage().totalSupply = $.DEPRECATED_totalSupply;
        $.DEPRECATED_totalSupply = 0;
    }

    function _migrateBalanceIfNeeded(address tokenHolder) internal {
        ERC1410StorageWrapper.ERC1410BasicStorage storage $ = ERC1410StorageWrapper._erc1410BasicStorage();
        if ($.DEPRECATED_balances[tokenHolder] == 0) return;
        _erc20Storage().balances[tokenHolder] = $.DEPRECATED_balances[tokenHolder];
        $.DEPRECATED_balances[tokenHolder] = 0;
    }

    // --- View functions ---

    function _totalSupply() internal view returns (uint256 totalSupply_) {
        totalSupply_ = ERC1410StorageWrapper._erc1410BasicStorage().DEPRECATED_totalSupply;
        return totalSupply_ == 0 ? _erc20Storage().totalSupply : totalSupply_;
    }

    function _balanceOf(address tokenHolder) internal view returns (uint256 balance_) {
        balance_ = ERC1410StorageWrapper._erc1410BasicStorage().DEPRECATED_balances[tokenHolder];
        return balance_ == 0 ? _erc20Storage().balances[tokenHolder] : balance_;
    }

    function _allowance(address owner, address spender) internal view returns (uint256) {
        return _erc20Storage().allowed[owner][spender];
    }

    function _getName() internal view returns (string memory) {
        return _erc20Storage().name;
    }

    function _decimals() internal view returns (uint8) {
        return _erc20Storage().decimals;
    }

    function _isERC20Initialized() internal view returns (bool) {
        return _erc20Storage().initialized;
    }

    function _getERC20Metadata() internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        ERC20Storage storage erc20Stor = _erc20Storage();
        IERC20.ERC20MetadataInfo memory erc20Info = IERC20.ERC20MetadataInfo({
            name: erc20Stor.name,
            symbol: erc20Stor.symbol,
            isin: erc20Stor.isin,
            decimals: erc20Stor.decimals
        });
        erc20Metadata_ = IERC20.ERC20Metadata({ info: erc20Info, securityType: erc20Stor.securityType });
    }

    function _getERC20MetadataAdjustedAt(
        uint256 timestamp
    ) internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        (, uint8 pendingDecimals) = ScheduledTasksStorageWrapper._getPendingScheduledBalanceAdjustmentsAt(timestamp);
        erc20Metadata_ = _getERC20Metadata();
        erc20Metadata_.info.decimals += pendingDecimals;
    }

    function _decimalsAdjustedAt(uint256 timestamp) internal view returns (uint8) {
        return _getERC20MetadataAdjustedAt(timestamp).info.decimals;
    }

    function _allowanceAdjustedAt(address owner, address spender, uint256 timestamp) internal view returns (uint256) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getAllowanceLabaf(owner, spender)
        );
        return _allowance(owner, spender) * factor;
    }

    // --- Allowance updates ---

    function _beforeAllowanceUpdate(address owner, address spender) internal {
        ERC1410StorageWrapper._triggerAndSyncAll(_DEFAULT_PARTITION, owner, address(0));
        _updateAllowanceAndLabaf(owner, spender);
    }

    function _updateAllowanceAndLabaf(address owner, address spender) internal {
        uint256 abaf = AdjustBalancesStorageWrapper._getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper._getAllowanceLabaf(owner, spender);

        if (abaf == labaf) return;

        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(abaf, labaf);

        _erc20Storage().allowed[owner][spender] *= factor;
        AdjustBalancesStorageWrapper._updateAllowanceLabaf(owner, spender, abaf);
    }

    // --- Approval and transfers ---

    function _approve(address owner, address spender, uint256 value) internal returns (bool) {
        assert(owner != address(0));

        if (spender == address(0)) {
            revert IERC20StorageWrapper.SpenderWithZeroAddress();
        }

        _erc20Storage().allowed[owner][spender] = value;
        emit IERC20StorageWrapper.Approval(owner, spender, value);
        return true;
    }

    function _increaseAllowance(address spender, uint256 addedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IERC20StorageWrapper.SpenderWithZeroAddress();
        }

        _increaseAllowedBalance(msg.sender, spender, addedValue);

        return true;
    }

    function _decreaseAllowance(address spender, uint256 subtractedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IERC20StorageWrapper.SpenderWithZeroAddress();
        }
        _decreaseAllowedBalance(msg.sender, spender, subtractedValue);
        emit IERC20StorageWrapper.Approval(msg.sender, spender, _erc20Storage().allowed[msg.sender][spender]);
        return true;
    }

    function _transferFrom(address spender, address from, address to, uint256 value) internal returns (bool) {
        _decreaseAllowedBalance(from, spender, value);
        ERC1410StorageWrapper._transferByPartition(
            from,
            BasicTransferInfo(to, value),
            _DEFAULT_PARTITION,
            "",
            spender,
            ""
        );
        emit IERC20StorageWrapper.Transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal returns (bool) {
        ERC1410StorageWrapper._transferByPartition(
            from,
            BasicTransferInfo(to, value),
            _DEFAULT_PARTITION,
            "",
            address(0),
            ""
        );
        emit IERC20StorageWrapper.Transfer(from, to, value);
        return true;
    }

    function _mint(address to, uint256 value) internal {
        ERC1410StorageWrapper._issueByPartition(IssueData(_DEFAULT_PARTITION, to, value, ""));
        emit IERC20StorageWrapper.Transfer(address(0), to, value);
    }

    function _burn(address from, uint256 value) internal {
        ERC1410StorageWrapper._redeemByPartition(_DEFAULT_PARTITION, from, address(0), value, "", "");
        emit IERC20StorageWrapper.Transfer(from, address(0), value);
    }

    function _burnFrom(address account, uint256 value) internal {
        _decreaseAllowedBalance(account, msg.sender, value);
        _burn(account, value);
    }

    function _decreaseAllowedBalance(address from, address spender, uint256 value) internal {
        _beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = _erc20Storage();

        if (value > erc20Stor.allowed[from][spender]) {
            revert IERC20StorageWrapper.InsufficientAllowance(spender, from);
        }

        erc20Stor.allowed[from][spender] -= value;
    }

    function _increaseAllowedBalance(address from, address spender, uint256 value) internal {
        _beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = _erc20Storage();

        erc20Stor.allowed[from][spender] += value;

        emit IERC20StorageWrapper.Approval(from, spender, _erc20Storage().allowed[from][spender]);
    }
}
