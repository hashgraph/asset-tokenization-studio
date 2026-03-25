// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILock } from "./ILock.sol";
import { Lock } from "./Lock.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _LOCK_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";

contract LockFacet is Lock, IStaticFunctionSelectors {
    // ========================================================================
    // State changing functions (external - must come first)
    // ========================================================================

    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        (success_, lockId_) = LockStorageWrapper.lockByPartition(
            _DEFAULT_PARTITION,
            _amount,
            _tokenHolder,
            _expirationTimestamp,
            msg.sender
        );
    }

    /**
     * @notice Release tokens (default partition)
     * @param _lockId The lock identifier
     * @param _tokenHolder The token holder address
     * @return success_ Boolean indicating success
     */
    function release(
        uint256 _lockId,
        address _tokenHolder
    )
        external
        override
        onlyUnpaused
        onlyWithValidLockId(_DEFAULT_PARTITION, _tokenHolder, _lockId)
        onlyWithLockedExpirationTimestamp(_DEFAULT_PARTITION, _tokenHolder, _lockId)
        returns (bool success_)
    {
        success_ = LockStorageWrapper.releaseByPartition(_DEFAULT_PARTITION, _lockId, _tokenHolder, msg.sender);
        emit LockByPartitionReleased(msg.sender, _tokenHolder, _DEFAULT_PARTITION, _lockId);
    }

    // ========================================================================
    // View functions (external view - after external)
    // ========================================================================

    function getLockByPartition(
        bytes32 _partition,
        uint256 _lockId
    ) external view override returns (LockData memory lockData_) {
        lockData_ = LockStorageWrapper.getLock(_partition, msg.sender, _lockId);
    }

    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        amount_ = LockStorageWrapper.getLockedAmountForByPartition(_partition, _tokenHolder);
    }

    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 lockCount_) {
        lockCount_ = LockStorageWrapper.getLockCountForByPartition(_partition, _tokenHolder);
    }

    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_) {
        locksId_ = LockStorageWrapper.getLocksIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        (amount_, expirationTimestamp_) = LockStorageWrapper.getLockForByPartition(_partition, _tokenHolder, _lockId);
    }

    function getLockedAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        amount_ = LockStorageWrapper.getLockedAmountFor(_tokenHolder);
    }

    function getLockCountFor(address _tokenHolder) external view override returns (uint256 lockCount_) {
        lockCount_ = LockStorageWrapper.getLockCountFor(_tokenHolder);
    }

    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_) {
        locksId_ = LockStorageWrapper.getLocksIdFor(_tokenHolder, _pageIndex, _pageLength);
    }

    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        LockStorageWrapper.requireValidLockId(_DEFAULT_PARTITION, _tokenHolder, _lockId);
        ILock.LockData memory lock = LockStorageWrapper.getLock(_DEFAULT_PARTITION, _tokenHolder, _lockId);
        amount_ = lock.amount;
        expirationTimestamp_ = lock.expirationTimestamp;
    }

    // ========================================================================
    // IStaticFunctionSelectors implementation (external pure - must come last)
    // ========================================================================

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOCK_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](14);
        staticFunctionSelectors_[selectorIndex++] = this.lockByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.releaseByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.forceReleaseByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.lock.selector;
        staticFunctionSelectors_[selectorIndex++] = this.release.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockedAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockCountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLocksIdFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockedAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLocksIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ILock).interfaceId;
    }
}
