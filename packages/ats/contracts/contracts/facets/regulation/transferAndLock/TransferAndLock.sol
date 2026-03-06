// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { _LOCKER_ROLE } from "../../../constants/roles.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { BasicTransferInfo } from "../../core/ERC1400/ERC1410/IERC1410Types.sol";
import { LibAccess } from "../../../domain/core/LibAccess.sol";
import { LibPause } from "../../../domain/core/LibPause.sol";
import { LibProtectedPartitions } from "../../../domain/core/LibProtectedPartitions.sol";
import { LibERC1410 } from "../../../domain/asset/LibERC1410.sol";
import { LibABAF } from "../../../domain/asset/LibABAF.sol";
import { LibLock } from "../../../domain/asset/LibLock.sol";
import { LibSnapshots } from "../../../domain/asset/LibSnapshots.sol";
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
        LibAccess.checkRole(_LOCKER_ROLE, msg.sender);
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        _checkValidExpirationTimestamp(_expirationTimestamp);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();

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
        LibAccess.checkRole(_LOCKER_ROLE, msg.sender);
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        _checkValidExpirationTimestamp(_expirationTimestamp);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();

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
