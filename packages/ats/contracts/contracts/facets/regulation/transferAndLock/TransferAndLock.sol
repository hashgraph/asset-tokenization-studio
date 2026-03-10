// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { _LOCKER_ROLE } from "../../../constants/roles.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { BasicTransferInfo } from "../../core/ERC1400/ERC1410/IERC1410Types.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract TransferAndLock is ITransferAndLock, TimestampProvider {
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        AccessStorageWrapper.checkRole(_LOCKER_ROLE, msg.sender);
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        _checkValidExpirationTimestamp(_expirationTimestamp);
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();

        TokenCoreOps.transferByPartition(
            msg.sender,
            BasicTransferInfo(_to, _amount),
            _partition,
            _data,
            msg.sender,
            "",
            _getBlockTimestamp(),
            _getBlockNumber()
        );

        (success_, lockId_) = _lockByPartition(_partition, _amount, _to, _expirationTimestamp);

        emit PartitionTransferredAndLocked(_partition, msg.sender, _to, _amount, _data, _expirationTimestamp, lockId_);
    }

    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        AccessStorageWrapper.checkRole(_LOCKER_ROLE, msg.sender);
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        _checkValidExpirationTimestamp(_expirationTimestamp);
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();

        TokenCoreOps.transferByPartition(
            msg.sender,
            BasicTransferInfo(_to, _amount),
            _DEFAULT_PARTITION,
            _data,
            msg.sender,
            "",
            _getBlockTimestamp(),
            _getBlockNumber()
        );

        (success_, lockId_) = _lockByPartition(_DEFAULT_PARTITION, _amount, _to, _expirationTimestamp);

        emit PartitionTransferredAndLocked(
            _DEFAULT_PARTITION,
            msg.sender,
            _to,
            _amount,
            _data,
            _expirationTimestamp,
            lockId_
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal returns (bool success_, uint256 lockId_) {
        ABAFStorageWrapper.triggerAndSyncAll(_partition, _tokenHolder, address(0));
        uint256 abaf = LockStorageWrapper.updateTotalLock(_partition, _tokenHolder);

        SnapshotsStorageWrapper.updateAccountSnapshot(_tokenHolder, _partition);
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(_tokenHolder, _partition);

        ERC1410StorageWrapper.reduceBalanceByPartition(_tokenHolder, _amount, _partition);

        lockId_ = LockStorageWrapper.createLockByPartition(_partition, _amount, _tokenHolder, _expirationTimestamp);
        ABAFStorageWrapper.setLockLabafById(_partition, _tokenHolder, lockId_, abaf);

        success_ = true;
    }

    function _checkValidExpirationTimestamp(uint256 _expirationTimestamp) internal view {
        if (_expirationTimestamp <= _getBlockTimestamp()) {
            revert LockStorageWrapper.WrongExpirationTimestamp();
        }
    }
}
