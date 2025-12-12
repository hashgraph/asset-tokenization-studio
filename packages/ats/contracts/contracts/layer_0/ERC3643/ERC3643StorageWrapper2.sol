// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../constants/values.sol";
import { SnapshotsStorageWrapper2 } from "../snapshots/SnapshotsStorageWrapper2.sol";
import { IERC3643Management } from "../../layer_1/interfaces/ERC3643/IERC3643Management.sol";

abstract contract ERC3643StorageWrapper2 is SnapshotsStorageWrapper2 {
    modifier onlyEmptyWallet(address _tokenHolder) override {
        if (!_canRecover(_tokenHolder)) revert IERC3643Management.CannotRecoverWallet();
        _;
    }

    function _setName(string calldata _name) internal returns (ERC20Storage storage erc20Storage_) {
        erc20Storage_ = _erc20Storage();
        erc20Storage_.name = _name;
    }

    function _setSymbol(string calldata _symbol) internal returns (ERC20Storage storage erc20Storage_) {
        erc20Storage_ = _erc20Storage();
        erc20Storage_.symbol = _symbol;
    }

    function _freezeTokens(address _account, uint256 _amount) internal override {
        _freezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _unfreezeTokens(address _account, uint256 _amount) internal override {
        _checkUnfreezeAmount(_DEFAULT_PARTITION, _account, _amount);
        _unfreezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal override {
        _triggerAndSyncAll(_partition, _account, address(0));

        _updateTotalFreeze(_partition, _account);

        _beforeFreeze(_partition, _account);
        IERC3643Management.ERC3643Storage storage st = _erc3643Storage();
        st.frozenTokens[_account] += _amount;
        st.frozenTokensByPartition[_account][_partition] += _amount;

        _reduceBalanceByPartition(_account, _amount, _partition);
    }

    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal override {
        _triggerAndSyncAll(_partition, _account, address(0));

        _updateTotalFreeze(_partition, _account);

        _beforeFreeze(_partition, _account);
        IERC3643Management.ERC3643Storage storage st = _erc3643Storage();
        st.frozenTokens[_account] -= _amount;
        st.frozenTokensByPartition[_account][_partition] -= _amount;
        _transferFrozenBalance(_partition, _account, _amount);
    }

    function _updateTotalFreeze(bytes32 _partition, address _tokenHolder) internal override returns (uint256 abaf_) {
        abaf_ = _getAbaf();
        uint256 labaf = _getTotalFrozenLabaf(_tokenHolder);
        uint256 labafByPartition = _getTotalFrozenLabafByPartition(_partition, _tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = _calculateFactor(abaf_, labaf);

            _updateTotalFreezeAmountAndLabaf(_tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = _calculateFactor(abaf_, labafByPartition);

            _updateTotalFreezeAmountAndLabafByPartition(_partition, _tokenHolder, factorByPartition, abaf_);
        }
    }

    function _beforeFreeze(bytes32 _partition, address _tokenHolder) internal override {
        _updateAccountSnapshot(_tokenHolder, _partition);
        _updateAccountFrozenBalancesSnapshot(_tokenHolder, _partition);
    }

    function _updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal override {
        if (_factor == 1) return;

        _erc3643Storage().frozenTokens[_tokenHolder] *= _factor;
        _setTotalFreezeLabaf(_tokenHolder, _abaf);
    }

    function _updateTotalFreezeAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal override {
        if (_factor == 1) return;

        _erc3643Storage().frozenTokensByPartition[_tokenHolder][_partition] *= _factor;
        _setTotalFreezeLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    function _transferFrozenBalance(bytes32 _partition, address _to, uint256 _amount) internal override {
        if (_validPartitionForReceiver(_partition, _to)) {
            _increaseBalanceByPartition(_to, _amount, _partition);
            return;
        }
        _addPartitionTo(_amount, _to, _partition);
    }

    function _recoveryAddress(address _lostWallet, address _newWallet) internal override returns (bool) {
        uint256 frozenBalance = _getFrozenAmountForAdjusted(_lostWallet);
        if (frozenBalance > 0) {
            _unfreezeTokens(_lostWallet, frozenBalance);
        }
        uint256 balance = _balanceOfAdjusted(_lostWallet);
        if (balance + frozenBalance > 0) {
            _transfer(_lostWallet, _newWallet, balance);
        }
        if (frozenBalance > 0) {
            _freezeTokens(_newWallet, frozenBalance);
        }
        if (_isInControlList(_lostWallet)) {
            _addToControlList(_newWallet);
        }
        _erc3643Storage().addressRecovered[_lostWallet] = true;
        _erc3643Storage().addressRecovered[_newWallet] = false;
        return true;
    }

    function _getFrozenAmountForAdjusted(address _tokenHolder) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactor(_getAbafAdjusted(), _getTotalFrozenLabaf(_tokenHolder));

        return _getFrozenAmountFor(_tokenHolder) * factor;
    }

    function _getFrozenAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactorForFrozenAmountByTokenHolderAdjustedAt(_tokenHolder, _timestamp);

        return _getFrozenAmountFor(_tokenHolder) * factor;
    }

    function _getTotalBalanceForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual override returns (uint256) {
        return
            super._getTotalBalanceForByPartitionAdjusted(_partition, _tokenHolder) +
            _getFrozenAmountForByPartitionAdjusted(_partition, _tokenHolder);
    }

    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual override returns (uint256) {
        return
            super._getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            _getFrozenAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function _getTotalBalance(address _tokenHolder) internal view virtual override returns (uint256) {
        return super._getTotalBalance(_tokenHolder) + _getFrozenAmountForAdjusted(_tokenHolder);
    }

    function _getFrozenAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactor(
            _getAbafAdjusted(),
            _getTotalFrozenLabafByPartition(_partition, _tokenHolder)
        );
        return _getFrozenAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    function _canRecover(address _tokenHolder) internal view override returns (bool isEmpty_) {
        isEmpty_ =
            _getLockedAmountFor(_tokenHolder) + _getHeldAmountFor(_tokenHolder) + _getClearedAmountFor(_tokenHolder) ==
            0;
    }

    function _checkUnfreezeAmount(bytes32 _partition, address _userAddress, uint256 _amount) private view {
        uint256 frozenAmount = _getFrozenAmountForByPartitionAdjusted(_partition, _userAddress);
        if (frozenAmount < _amount) {
            revert InsufficientFrozenBalance(_userAddress, _amount, frozenAmount, _partition);
        }
    }
}
