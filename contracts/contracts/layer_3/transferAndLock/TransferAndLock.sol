// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ITransferAndLock} from '../interfaces/ITransferAndLock.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_LOCKER_ROLE} from '../../layer_1/constants/roles.sol';
import {_DEFAULT_PARTITION} from '../../layer_1/constants/values.sol';
import {_TRANSFER_AND_LOCK_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {LockStorageWrapper} from '../../layer_1/lock/LockStorageWrapper.sol';
import {
    ERC1410ScheduledSnapshotStorageWrapper
} from '../../layer_2/ERC1400/ERC1410/ERC1410ScheduledSnapshotStorageWrapper.sol';

contract TransferAndLock is
    ITransferAndLock,
    IStaticFunctionSelectors,
    LockStorageWrapper,
    ERC1410ScheduledSnapshotStorageWrapper
{
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        virtual
        override
        onlyRole(_LOCKER_ROLE)
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        returns (bool success_, uint256 lockId_)
    {
        _transferByPartition(
            _msgSender(),
            _to,
            _amount,
            _partition,
            _data,
            _msgSender(),
            ''
        );
        (success_, lockId_) = _lockByPartition(
            _partition,
            _amount,
            _to,
            _expirationTimestamp
        );
        emit PartitionTransferredAndLocked(
            _partition,
            _msgSender(),
            _to,
            _amount,
            _data,
            _expirationTimestamp,
            lockId_
        );
    }

    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        virtual
        override
        onlyRole(_LOCKER_ROLE)
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        returns (bool success_, uint256 lockId_)
    {
        _transferByPartition(
            _msgSender(),
            _to,
            _amount,
            _DEFAULT_PARTITION,
            _data,
            _msgSender(),
            ''
        );
        (success_, lockId_) = _lockByPartition(
            _DEFAULT_PARTITION,
            _amount,
            _to,
            _expirationTimestamp
        );
        emit PartitionTransferredAndLocked(
            _DEFAULT_PARTITION,
            _msgSender(),
            _to,
            _amount,
            _data,
            _expirationTimestamp,
            lockId_
        );
    }

    function _beforeTokenTransfer(
        bytes32 partition,
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(partition, from, to, amount);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _TRANSFER_AND_LOCK_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this
            .transferAndLockByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .transferAndLock
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITransferAndLock)
            .interfaceId;
    }
}
