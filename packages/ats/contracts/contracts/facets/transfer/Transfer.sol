// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransfer, RESOLVER_KEY_TRANSFER } from "./ITransfer.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Transfer
 * @author Asset Tokenization Studio Team
 * @notice Implementation of the Transfer domain. Delegates into the existing storage wrappers so
 *         semantics match `ERC20` / `ERC1594` exactly.
 */
abstract contract Transfer is ITransfer, Modifiers {
    /// @inheritdoc ITransfer
    function initializeTransfer()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_TRANSFER)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_TRANSFER);
        emit TransferInitialized();
    }

    /// @inheritdoc ITransfer
    function transfer(
        address to,
        uint256 amount
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(EvmAccessors.getMsgSender(), to, _DEFAULT_PARTITION, amount)
        returns (bool)
    {
        return TokenCoreOps.transfer(EvmAccessors.getMsgSender(), to, amount);
    }

    /// @inheritdoc ITransfer
    function transferFrom(
        address from,
        address to,
        uint256 amount
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(from, to, _DEFAULT_PARTITION, amount)
        returns (bool)
    {
        return TokenCoreOps.transferFrom(EvmAccessors.getMsgSender(), from, to, amount);
    }

    /// @inheritdoc ITransfer
    function transferWithData(
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(EvmAccessors.getMsgSender(), _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transfer(EvmAccessors.getMsgSender(), _to, _value);
        emit TransferWithData(EvmAccessors.getMsgSender(), _to, _value, _data);
    }

    /// @inheritdoc ITransfer
    function transferFromWithData(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(_from, _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transferFrom(EvmAccessors.getMsgSender(), _from, _to, _value);
        emit TransferFromWithData(EvmAccessors.getMsgSender(), _from, _to, _value, _data);
    }
}
