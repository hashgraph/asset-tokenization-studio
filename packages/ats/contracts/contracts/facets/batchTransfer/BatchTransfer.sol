// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchTransfer } from "./IBatchTransfer.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

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
    function batchTransfer(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyClearingDisabled
        onlyIdentifiedAddresses(EvmAccessors.getMsgSender(), address(0))
        onlyCompliant(EvmAccessors.getMsgSender(), address(0), false)
    {
        uint256 length = _toList.length;
        for (uint256 i; i < length; ) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(address(0), _toList[i], false);
            unchecked {
                ++i;
            }
        }
        for (uint256 i; i < length; ) {
            TokenCoreOps.transfer(EvmAccessors.getMsgSender(), _toList[i], _amounts[i]);
            unchecked {
                ++i;
            }
        }
    }
}
