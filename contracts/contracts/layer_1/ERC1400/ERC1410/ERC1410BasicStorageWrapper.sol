// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IERC1410StorageWrapper
} from '../../interfaces/ERC1400/IERC1410StorageWrapper.sol';
import {Common} from '../../common/Common.sol';
import {
    ERC1410BasicStorageWrapperRead
} from './ERC1410BasicStorageWrapperRead.sol';

abstract contract ERC1410BasicStorageWrapper is
    IERC1410StorageWrapper,
    Common,
    ERC1410BasicStorageWrapperRead
{
    function _transferByPartition(
        address _from,
        address _to,
        uint256 _value,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) internal virtual {
        ERC1410BasicStorage storage erc1410Storage = _getERC1410BasicStorage();
        if (!_validPartition(_partition, _from)) {
            revert InvalidPartition(_from, _partition);
        }

        _beforeTokenTransfer(_partition, _from, _to, _value);

        if (!_validPartitionForReceiver(_partition, _to)) {
            erc1410Storage.partitions[_to].push(Partition(0, _partition));
            erc1410Storage.partitionToIndex[_to][
                _partition
            ] = _getERC1410BasicStorage().partitions[_to].length;
        }

        // Changing the state values
        _reduceBalanceByPartition(_from, _value, _partition);
        _increaseBalanceByPartition(_to, _value, _partition);

        // Emit transfer event.
        emit TransferByPartition(
            _partition,
            _operator,
            _from,
            _to,
            _value,
            _data,
            _operatorData
        );
    }

    function _beforeTokenTransfer(
        bytes32 partition,
        address from,
        address to,
        uint256 amount
    ) internal virtual;
}
