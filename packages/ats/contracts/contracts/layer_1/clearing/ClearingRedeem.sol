// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../layer_0/common/Common.sol";
import { IClearingRedeem } from "../interfaces/clearing/IClearingRedeem.sol";
import { ThirdPartyType } from "../../layer_0/common/types/ThirdPartyType.sol";

abstract contract ClearingRedeem is IClearingRedeem, Common {
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_msgSender())
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = _clearingRedeemCreation(
            _clearingOperation,
            _amount,
            _msgSender(),
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingRedeemFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        onlyDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(_msgSender())
        validateAddress(_clearingOperationFrom.from)
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = _clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );
        _decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Redeem,
            _clearingOperationFrom.from,
            _amount
        );
    }

    function operatorClearingRedeemByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        onlyDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        validateAddress(_clearingOperationFrom.from)
        onlyUnrecoveredAddress(_msgSender())
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        {
            _checkOperator(_clearingOperationFrom.clearingOperation.partition, _clearingOperationFrom.from);
        }

        (success_, clearingId_) = _clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingRedeemByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    )
        external
        override
        onlyUnpaused
        onlyProtectedPartitions
        validateAddress(_protectedClearingOperation.from)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(_protectedPartitionsRole(_protectedClearingOperation.clearingOperation.partition))
        onlyClearingActivated
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = _protectedClearingRedeemByPartition(_protectedClearingOperation, _amount, _signature);
    }

    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingRedeemData memory clearingRedeemData_) {
        return _getClearingRedeemForByPartitionAdjusted(_partition, _tokenHolder, _clearingId);
    }
}
