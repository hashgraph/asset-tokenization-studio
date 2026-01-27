// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICapStorageWrapper } from "../../layer_1/interfaces/cap/ICapStorageWrapper.sol";
import { LockStorageWrapper2 } from "../lock/LockStorageWrapper2.sol";

abstract contract CapStorageWrapper2 is ICapStorageWrapper, LockStorageWrapper2 {
    // modifiers
    modifier onlyWithinMaxSupply(uint256 _amount) override {
        _checkWithinMaxSupply(_amount);
        _;
    }

    modifier onlyWithinMaxSupplyByPartition(bytes32 _partition, uint256 _amount) override {
        _checkWithinMaxSupplyByPartition(_partition, _amount);
        _;
    }

    modifier onlyValidNewMaxSupply(uint256 _newMaxSupply) override {
        _checkNewMaxSupply(_newMaxSupply);
        _;
    }

    modifier onlyValidNewMaxSupplyByPartition(bytes32 _partition, uint256 _newMaxSupply) override {
        _checkNewMaxSupplyByPartition(_partition, _newMaxSupply);
        _;
    }

    // Internal
    function _setMaxSupply(uint256 _maxSupply) internal override {
        uint256 previousMaxSupply = _getMaxSupply();
        _capStorage().maxSupply = _maxSupply;
        emit MaxSupplySet(_msgSender(), _maxSupply, previousMaxSupply);
    }

    function _setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) internal override {
        uint256 previousMaxSupplyByPartition = _getMaxSupplyByPartition(_partition);
        _capStorage().maxSupplyByPartition[_partition] = _maxSupply;
        emit MaxSupplyByPartitionSet(_msgSender(), _partition, _maxSupply, previousMaxSupplyByPartition);
    }

    function _checkNewMaxSupplyByPartition(bytes32 _partition, uint256 _newMaxSupply) internal view override {
        if (_newMaxSupply == 0) return;
        uint256 totalSupplyForPartition = _totalSupplyByPartitionAdjustedAt(_partition, _blockTimestamp());
        if (totalSupplyForPartition > _newMaxSupply) {
            revert NewMaxSupplyForPartitionTooLow(_partition, _newMaxSupply, totalSupplyForPartition);
        }
        uint256 maxSupplyOverall = _getMaxSupplyAdjustedAt(_blockTimestamp());
        if (_newMaxSupply > maxSupplyOverall) {
            revert NewMaxSupplyByPartitionTooHigh(_partition, _newMaxSupply, maxSupplyOverall);
        }
    }

    function _checkWithinMaxSupply(uint256 _amount) internal view override {
        uint256 maxSupply = _getMaxSupply();
        if (!_isCorrectMaxSupply(_totalSupply() + _amount, maxSupply)) {
            revert ICapStorageWrapper.MaxSupplyReached(maxSupply);
        }
    }

    function _checkWithinMaxSupplyByPartition(bytes32 _partition, uint256 _amount) private view {
        uint256 maxSupplyForPartition = _getMaxSupplyByPartition(_partition);
        if (!_isCorrectMaxSupply(_totalSupplyByPartition(_partition) + _amount, maxSupplyForPartition)) {
            revert ICapStorageWrapper.MaxSupplyReachedForPartition(_partition, maxSupplyForPartition);
        }
    }

    function _checkNewMaxSupply(uint256 _newMaxSupply) private view {
        if (_newMaxSupply == 0) {
            revert NewMaxSupplyCannotBeZero();
        }
        uint256 totalSupply = _totalSupplyAdjustedAt(_blockTimestamp());
        if (totalSupply > _newMaxSupply) {
            revert NewMaxSupplyTooLow(_newMaxSupply, totalSupply);
        }
    }
}
