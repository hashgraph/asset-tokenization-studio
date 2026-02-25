// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { _LOCKER_ROLE } from "../../../constants/roles.sol";
import { ITransferAndLock } from "../interfaces/ITransferAndLock.sol";
import { BasicTransferInfo } from "../../features/interfaces/ERC1400/IERC1410.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibLock } from "../../../lib/domain/LibLock.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibTokenTransfer } from "../../../lib/orchestrator/LibTokenTransfer.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

abstract contract TransferAndLock is ITransferAndLock, TimestampProvider {
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        LibAccess.checkRole(_LOCKER_ROLE, msg.sender);
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        _checkValidExpirationTimestamp(_expirationTimestamp);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();

        LibTokenTransfer.transferByPartition(
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
        LibAccess.checkRole(_LOCKER_ROLE, msg.sender);
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        _checkValidExpirationTimestamp(_expirationTimestamp);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();

        LibTokenTransfer.transferByPartition(
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
        LibABAF.triggerAndSyncAll(_partition, _tokenHolder, address(0));
        uint256 abaf = LibLock.updateTotalLock(_partition, _tokenHolder);

        LibSnapshots.updateAccountSnapshot(_tokenHolder, _partition);
        LibSnapshots.updateAccountLockedBalancesSnapshot(_tokenHolder, _partition);

        LibERC1410.reduceBalanceByPartition(_tokenHolder, _amount, _partition);

        lockId_ = LibLock.createLockByPartition(_partition, _amount, _tokenHolder, _expirationTimestamp);
        LibABAF.setLockLabafById(_partition, _tokenHolder, lockId_, abaf);

        success_ = true;
    }

    function _checkValidExpirationTimestamp(uint256 _expirationTimestamp) internal view {
        if (_expirationTimestamp <= _getBlockTimestamp()) {
            revert LibLock.WrongExpirationTimestamp();
        }
    }
}
