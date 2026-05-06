// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "./IERC1410Types.sol";
import { IERC1410TokenHolder } from "./IERC1410TokenHolder.sol";

import { Modifiers } from "../../../../services/Modifiers.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

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
        onlyCanTransferFromByPartition(
            EvmAccessors.getMsgSender(),
            _basicTransferInfo.to,
            _partition,
            _basicTransferInfo.value
        )
        returns (bytes32)
    {
        return
            TokenCoreOps.transferByPartition(
                EvmAccessors.getMsgSender(),
                _basicTransferInfo,
                _partition,
                _data,
                address(0),
                ""
            );
    }
}
