pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {ILock} from '../interfaces/lock/ILock.sol';
import {_LOCKER_ROLE} from '../constants/roles.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_LOCK_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {Common} from '../common/Common.sol';
import {LockStorageWrapper} from './LockStorageWrapper.sol';
import {_DEFAULT_PARTITION} from '../constants/values.sol';

contract Lock is ILock, IStaticFunctionSelectors, Common, LockStorageWrapper {
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_LOCKER_ROLE)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        returns (bool success_, uint256 lockId_)
    {
        (success_, lockId_) = _lockByPartition(
            _partition,
            _amount,
            _tokenHolder,
            _expirationTimestamp
        );
        emit LockedByPartition(
            _msgSender(),
            _tokenHolder,
            _partition,
            lockId_,
            _amount,
            _expirationTimestamp
        );
    }

    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    )
        external
        virtual
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidLockId(_partition, _tokenHolder, _lockId)
        onlyWithLockedExpirationTimestamp(_partition, _tokenHolder, _lockId)
        returns (bool success_)
    {
        success_ = _releaseByPartition(_partition, _lockId, _tokenHolder);
        emit LockByPartitionReleased(
            _msgSender(),
            _tokenHolder,
            _partition,
            _lockId
        );
    }

    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view virtual override returns (uint256 amount_) {
        return _getLockedAmountForByPartition(_partition, _tokenHolder);
    }

    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view virtual override returns (uint256 lockCount_) {
        return _getLockCountForByPartition(_partition, _tokenHolder);
    }

    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (uint256[] memory locksId_) {
        return
            _getLocksIdForByPartition(
                _partition,
                _tokenHolder,
                _pageIndex,
                _pageLength
            );
    }

    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    )
        external
        view
        virtual
        override
        returns (uint256 amount_, uint256 expirationTimestamp_)
    {
        return _getLockForByPartition(_partition, _tokenHolder, _lockId);
    }

    // Uses default parititon in case Multipartition is not activated
    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_LOCKER_ROLE)
        onlyWithoutMultiPartition
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        returns (bool success_, uint256 lockId_)
    {
        (success_, lockId_) = _lockByPartition(
            _DEFAULT_PARTITION,
            _amount,
            _tokenHolder,
            _expirationTimestamp
        );
        emit LockedByPartition(
            _msgSender(),
            _tokenHolder,
            _DEFAULT_PARTITION,
            lockId_,
            _amount,
            _expirationTimestamp
        );
    }

    function release(
        uint256 _lockId,
        address _tokenHolder
    )
        external
        virtual
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyWithValidLockId(_DEFAULT_PARTITION, _tokenHolder, _lockId)
        onlyWithLockedExpirationTimestamp(
            _DEFAULT_PARTITION,
            _tokenHolder,
            _lockId
        )
        returns (bool success_)
    {
        success_ = _releaseByPartition(
            _DEFAULT_PARTITION,
            _lockId,
            _tokenHolder
        );
        emit LockByPartitionReleased(
            _msgSender(),
            _tokenHolder,
            _DEFAULT_PARTITION,
            _lockId
        );
    }

    function getLockedAmountFor(
        address _tokenHolder
    ) external view virtual override returns (uint256 amount_) {
        return _getLockedAmountForByPartition(_DEFAULT_PARTITION, _tokenHolder);
    }

    function getLockCountFor(
        address _tokenHolder
    ) external view virtual override returns (uint256 lockCount_) {
        return _getLockCountForByPartition(_DEFAULT_PARTITION, _tokenHolder);
    }

    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (uint256[] memory locksId_) {
        return
            _getLocksIdForByPartition(
                _DEFAULT_PARTITION,
                _tokenHolder,
                _pageIndex,
                _pageLength
            );
    }

    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    )
        external
        view
        virtual
        override
        returns (uint256 amount_, uint256 expirationTimestamp_)
    {
        return
            _getLockForByPartition(_DEFAULT_PARTITION, _tokenHolder, _lockId);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _LOCK_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](12);
        staticFunctionSelectors_[selectorIndex++] = this
            .lockByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .releaseByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getLockedAmountForByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getLockCountForByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getLocksIdForByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getLockForByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.lock.selector;
        staticFunctionSelectors_[selectorIndex++] = this.release.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getLockedAmountFor
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getLockCountFor
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLocksIdFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockFor.selector;
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
        staticInterfaceIds_[selectorsIndex++] = type(ILock).interfaceId;
    }
}
