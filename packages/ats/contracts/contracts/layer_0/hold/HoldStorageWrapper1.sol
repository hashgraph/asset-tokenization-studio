// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {LibCommon} from '../common/libraries/LibCommon.sol';
import {_HOLD_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {ERC3643StorageWrapper1} from '../ERC3643/ERC3643StorageWrapper1.sol';
import {
    IHold,
    Hold,
    HoldData,
    HoldIdentifier,
    HoldDataStorage
} from '../../layer_1/interfaces/hold/IHold.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {ThirdPartyType} from '../common/types/ThirdPartyType.sol';

abstract contract HoldStorageWrapper1 is ERC3643StorageWrapper1 {
    using LibCommon for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    modifier onlyWithValidHoldId(HoldIdentifier calldata _holdIdentifier) {
        _checkHoldId(_holdIdentifier);
        _;
    }

    function _isHoldIdValid(
        HoldIdentifier memory _holdIdentifier
    ) internal view returns (bool) {
        return _getHold(_holdIdentifier).id != 0;
    }

    function _getHold(
        HoldIdentifier memory _holdIdentifier
    ) internal view returns (HoldData memory) {
        return
            _holdStorage().holdsByAccountPartitionAndId[
                _holdIdentifier.tokenHolder
            ][_holdIdentifier.partition][_holdIdentifier.holdId];
    }

    function _getHeldAmountFor(
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        return _holdStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    function _getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        return
            _holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][
                _partition
            ];
    }

    function _getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory holdsId_) {
        return
            _holdStorage()
            .holdIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(
                    _pageIndex,
                    _pageLength
                );
    }

    function _getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        internal
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        )
    {
        HoldData memory holdData = _getHold(_holdIdentifier);
        return (
            holdData.hold.amount,
            holdData.hold.expirationTimestamp,
            holdData.hold.escrow,
            holdData.hold.to,
            holdData.hold.data,
            holdData.operatorData,
            holdData.thirdPartyType
        );
    }

    function _getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256) {
        return
            _holdStorage()
            .holdIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    function _isHoldExpired(Hold memory _hold) internal view returns (bool) {
        return _blockTimestamp() > _hold.expirationTimestamp;
    }

    function _isEscrow(
        Hold memory _hold,
        address _escrow
    ) internal pure returns (bool) {
        return _escrow == _hold.escrow;
    }

    function _checkHoldAmount(
        uint256 _amount,
        HoldData memory holdData
    ) internal pure {
        if (_amount > holdData.hold.amount)
            revert IHold.InsufficientHoldBalance(holdData.hold.amount, _amount);
    }

    function _holdStorage()
        internal
        pure
        returns (HoldDataStorage storage hold_)
    {
        bytes32 position = _HOLD_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hold_.slot := position
        }
    }

    function _checkHoldId(
        HoldIdentifier calldata _holdIdentifier
    ) private view {
        if (!_isHoldIdValid(_holdIdentifier)) revert IHold.WrongHoldId();
    }
}
