pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {LocalContext} from '../context/LocalContext.sol';
import {ICapStorageWrapper} from '../interfaces/cap/ICapStorageWrapper.sol';
import {_CAP_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {
    ERC1410BasicStorageWrapperRead
} from '../ERC1400/ERC1410/ERC1410BasicStorageWrapperRead.sol';

abstract contract CapStorageWrapper is
    ICapStorageWrapper,
    LocalContext,
    ERC1410BasicStorageWrapperRead
{
    struct CapDataStorage {
        uint256 maxSupply;
        mapping(bytes32 => uint256) maxSupplyByPartition;
        bool initialized;
    }

    // modifiers
    modifier checkMaxSupply(uint256 _amount) {
        uint256 newTotalSupply = _totalSupply() + _amount;
        if (!_checkMaxSupply(newTotalSupply)) {
            revert MaxSupplyReached(_capStorage().maxSupply);
        }
        _;
    }

    modifier checkMaxSupplyForPartition(bytes32 _partition, uint256 _amount) {
        uint256 newTotalSupplyForPartition = _totalSupplyByPartition(
            _partition
        ) + _amount;
        if (
            !_checkMaxSupplyByPartition(_partition, newTotalSupplyForPartition)
        ) {
            revert MaxSupplyReachedForPartition(
                _partition,
                _capStorage().maxSupplyByPartition[_partition]
            );
        }
        _;
    }

    modifier checkNewMaxSupply(uint256 _newMaxSupply) {
        uint256 totalSupply = _totalSupply();
        if (_newMaxSupply != 0 && totalSupply > _newMaxSupply) {
            revert NewMaxSupplyTooLow(_newMaxSupply, totalSupply);
        }
        _;
    }

    modifier checkNewMaxSupplyForPartition(
        bytes32 _partition,
        uint256 _newMaxSupply
    ) {
        uint256 totalSupplyForPartition = _totalSupplyByPartition(_partition);
        if (_newMaxSupply != 0 && totalSupplyForPartition > _newMaxSupply) {
            revert NewMaxSupplyForPartitionTooLow(
                _partition,
                _newMaxSupply,
                totalSupplyForPartition
            );
        }
        _;
    }

    // Internal
    function _setMaxSupply(uint256 _maxSupply) internal virtual {
        uint256 previousMaxSupply = _capStorage().maxSupply;
        _capStorage().maxSupply = _maxSupply;
        emit MaxSupplySet(_msgSender(), _maxSupply, previousMaxSupply);
    }

    function _setMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _maxSupply
    ) internal virtual {
        uint256 previousMaxSupply = _capStorage().maxSupplyByPartition[
            _partition
        ];
        _capStorage().maxSupplyByPartition[_partition] = _maxSupply;
        emit MaxSupplyByPartitionSet(
            _msgSender(),
            _partition,
            _maxSupply,
            previousMaxSupply
        );
    }

    function _getMaxSupply()
        internal
        view
        virtual
        returns (uint256 maxSupply_)
    {
        return _capStorage().maxSupply;
    }

    function _getMaxSupplyByPartition(
        bytes32 _partition
    ) internal view virtual returns (uint256 maxSupply_) {
        return _capStorage().maxSupplyByPartition[_partition];
    }

    function _checkMaxSupply(
        uint256 _amount
    ) internal view virtual returns (bool) {
        return _checkMaxSupplyCommon(_amount, _capStorage().maxSupply);
    }

    function _checkMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _amount
    ) internal view virtual returns (bool) {
        return
            _checkMaxSupplyCommon(
                _amount,
                _capStorage().maxSupplyByPartition[_partition]
            );
    }

    function _checkMaxSupplyCommon(
        uint256 _amount,
        uint256 _maxSupply
    ) private pure returns (bool) {
        if (_maxSupply == 0) return true;
        if (_amount <= _maxSupply) return true;
        return false;
    }

    function _capStorage()
        internal
        pure
        virtual
        returns (CapDataStorage storage cap_)
    {
        bytes32 position = _CAP_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cap_.slot := position
        }
    }
}
