// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchTransfer, RESOLVER_KEY_BATCH_TRANSFER } from "./IBatchTransfer.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_PARTITION } from "../../constants/values.sol";
import { EMPTY_BYTES } from "../../constants/values.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BatchTransfer
 * @notice Abstract implementation of `IBatchTransfer` that transfers tokens from the caller
 *         to multiple recipients in a single, atomic transaction.
 * @dev Caller must hold sufficient balance. Token must be unpaused, single-partition, clearing
 *      disabled, and every recipient plus the caller must pass identity and compliance checks.
 *      Delegates transfer execution to `TokenCoreOps`. Intended to be inherited by
 *      `BatchTransferFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract BatchTransfer is IBatchTransfer, Modifiers {
    /// @inheritdoc IBatchTransfer
    function initializeBatchTransfer()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BATCH_TRANSFER)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BATCH_TRANSFER);
        emit BatchTransferInitialized();
    }

    /// @inheritdoc IBatchTransfer
    function batchTransfer(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
    {
        address sender = EvmAccessors.getMsgSender();
        uint256 length = _checkBatchTransferBalances(sender, _toList, _amounts, DEFAULT_PARTITION);
        for (uint256 i; i < length; ) {
            TokenCoreOps.transfer(sender, _toList[i], _amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    function _checkBatchTransferBalances(
        address _from,
        address[] calldata _toList,
        uint256[] calldata _amounts,
        bytes32 _partition
    ) private returns (uint256 length_) {
        length_ = _toList.length;
        uint256 total;

        for (uint256 i; i < length_; ) {
            uint256 amount = _amounts[i];
            ERC1410StorageWrapper.checkNonZeroTransferAmount(amount);
            ERC1594StorageWrapper.checkCanTransferFromByPartition(
                _from,
                _toList[i],
                _partition,
                amount,
                EMPTY_BYTES,
                EMPTY_BYTES
            );
            unchecked {
                total += amount;
                ++i;
            }
        }
        ERC1594StorageWrapper.checkPartitionBalance(_from, total, DEFAULT_PARTITION);
    }
}
