// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "../commonTypes/IERC1410Types.sol";
import { ITransferByPartition, RESOLVER_KEY_TRANSFER_BY_PARTITION } from "./ITransferByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/// @title TransferByPartition
/// @author Asset Tokenization Studio Team
/// @notice Abstract base for the TransferByPartition facet, exposing token-holder-initiated
///         partition transfers.
/// @dev Stateless; delegates to {TokenCoreOps.transferByPartition}.
///      Abstract because it is composed into the Diamond alongside other facets.
abstract contract TransferByPartition is ITransferByPartition, Modifiers {
    /// @inheritdoc ITransferByPartition
    function initializeTransferByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_TRANSFER_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_TRANSFER_BY_PARTITION);
        emit TransferByPartitionInitialized();
    }

    /// @inheritdoc ITransferByPartition
    function transferByPartition(
        bytes32 _partition,
        IERC1410Types.BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    )
        external
        override
        onlyOperational
        onlyActivated
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

        /// @dev TransferByPartition event should be emitted here, and not in
        /// in the ERC1410StorageWrapper.transferByPartition function
    }
}
