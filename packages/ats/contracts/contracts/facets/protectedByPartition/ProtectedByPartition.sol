// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedByPartition } from "./IProtectedByPartition.sol";
import { IProtectedPartitions } from "../layer_1/protectedPartition/IProtectedPartitions.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ProtectedByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract facet implementation for protected partition-scoped transfer and
 *         redemption operations, extracted from `ERC1410Management` as part of the MAF
 *         (Modular Asset Factory) decomposition.
 * @dev Forwards write logic to `TokenCoreOps.protectedTransferFromByPartition` and
 *      `TokenCoreOps.protectedRedeemFromByPartition`. Authorisation is enforced by a
 *      partition-specific role obtained from `ProtectedPartitionsStorageWrapper`.
 *      Storage layout is unchanged; this contract only owns the selector exposure.
 */
abstract contract ProtectedByPartition is IProtectedByPartition, Modifiers {
    /// @inheritdoc IProtectedByPartition
    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanTransferFromByPartition(_from, _to, _partition, _amount)
        returns (bytes32)
    {
        return TokenCoreOps.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    /// @inheritdoc IProtectedByPartition
    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanRedeemFromByPartition(_from, _partition, _amount)
    {
        TokenCoreOps.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }
}
