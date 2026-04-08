// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";
import { IERC1410TokenHolder } from "./IERC1410TokenHolder.sol";
import { _WILD_CARD_ROLE } from "../../../../constants/roles.sol";

import { IProtectedPartitions } from "../../../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";

import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";

abstract contract ERC1410TokenHolder is IERC1410TokenHolder, Modifiers {
    function transferByPartition(
        bytes32 _partition,
        IERC1410Types.BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(msg.sender, _basicTransferInfo.to, _partition, _basicTransferInfo.value)
        returns (bytes32)
    {
        return TokenCoreOps.transferByPartition(msg.sender, _basicTransferInfo, _partition, _data, address(0), "");
    }

    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(msg.sender, _partition, _value)
    {
        TokenCoreOps.redeemByPartition(_partition, msg.sender, address(0), _value, _data, "");
    }

    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external onlyUnpaused {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, _to);
    }

    function authorizeOperator(address _operator) external override onlyUnpaused {
        ERC1594StorageWrapper.requireCompliant(msg.sender, _operator, false);
        ERC1410StorageWrapper.authorizeOperator(_operator);
    }

    function revokeOperator(address _operator) external override onlyUnpaused {
        ERC1594StorageWrapper.requireIdentified(msg.sender, _operator);
        ERC1594StorageWrapper.requireCompliant(msg.sender, _operator, false);
        ERC1410StorageWrapper.revokeOperator(_operator);
    }

    function authorizeOperatorByPartition(
        bytes32 _partition,
        address _operator
    ) external override onlyUnpaused onlyDefaultPartitionWithSinglePartition(_partition) {
        ERC1594StorageWrapper.requireCompliant(msg.sender, _operator, false);
        ERC1410StorageWrapper.authorizeOperatorByPartition(_partition, _operator);
    }

    function revokeOperatorByPartition(
        bytes32 _partition,
        address _operator
    ) external override onlyUnpaused onlyDefaultPartitionWithSinglePartition(_partition) {
        ERC1594StorageWrapper.requireIdentified(msg.sender, _operator);
        ERC1594StorageWrapper.requireCompliant(msg.sender, _operator, false);
        ERC1410StorageWrapper.revokeOperatorByPartition(_partition, _operator);
    }
}
