// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBurnByPartition } from "./IBurnByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title BurnByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the partition-aware token redemption operation.
 * @dev Implements `redeemByPartition` on top of `TokenCoreOps`. Enforces unpaused state,
 *      partition validity (single-partition mode), protected-partition and wildcard-role
 *      checks, and redemption authorization before delegating to the orchestrator library.
 *      Intended to be inherited by `BurnByPartitionFacet`.
 */
abstract contract BurnByPartition is IBurnByPartition, Modifiers {
    /// @inheritdoc IBurnByPartition
    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(EvmAccessors.getMsgSender(), _partition, _value)
    {
        TokenCoreOps.redeemByPartition(_partition, EvmAccessors.getMsgSender(), address(0), _value, _data, "");
    }
}
