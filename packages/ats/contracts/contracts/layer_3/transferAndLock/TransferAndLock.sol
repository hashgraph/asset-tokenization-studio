// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../layer_0/constants/values.sol";
import { _LOCKER_ROLE } from "../../layer_1/constants/roles.sol";
import { ITransferAndLock } from "../interfaces/ITransferAndLock.sol";
import { BasicTransferInfo } from "../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { Common } from "../../layer_0/common/Common.sol";
import { ITransferAndLock } from "../interfaces/ITransferAndLock.sol";

abstract contract TransferAndLock is ITransferAndLock, Common {
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyRole(_LOCKER_ROLE)
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 lockId_)
    {
        _transferByPartition(_msgSender(), BasicTransferInfo(_to, _amount), _partition, _data, _msgSender(), "");
        (success_, lockId_) = _lockByPartition(_partition, _amount, _to, _expirationTimestamp);
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
        override
        onlyRole(_LOCKER_ROLE)
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 lockId_)
    {
        _transferByPartition(
            _msgSender(),
            BasicTransferInfo(_to, _amount),
            _DEFAULT_PARTITION,
            _data,
            _msgSender(),
            ""
        );
        (success_, lockId_) = _lockByPartition(_DEFAULT_PARTITION, _amount, _to, _expirationTimestamp);
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

    function protectedTransferAndLockByPartition(
        bytes32 _partition,
        TransferAndLockStruct calldata _transferAndLockData,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    )
        external
        override
        onlyRoleFor(_LOCKER_ROLE, _transferAndLockData.from)
        onlyRole(_protectedPartitionsRole(_partition))
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidExpirationTimestamp(_transferAndLockData.expirationTimestamp)
        onlyProtectedPartitions
        returns (bool success_, uint256 lockId_)
    {
        return _protectedTransferAndLockByPartition(_partition, _transferAndLockData, _deadline, _nounce, _signature);
    }

    function protectedTransferAndLock(
        TransferAndLockStruct calldata _transferAndLockData,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    )
        external
        override
        onlyRoleFor(_LOCKER_ROLE, _transferAndLockData.from)
        onlyRole(_protectedPartitionsRole(_DEFAULT_PARTITION))
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyWithValidExpirationTimestamp(_transferAndLockData.expirationTimestamp)
        onlyProtectedPartitions
        returns (bool success_, uint256 lockId_)
    {
        return _protectedTransferAndLock(_transferAndLockData, _deadline, _nounce, _signature);
    }
}
