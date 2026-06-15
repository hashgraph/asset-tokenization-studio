// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperator, RESOLVER_KEY_OPERATOR } from "./IOperator.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  Operator
 * @notice Abstract implementation of `IOperator`.
 * @dev    Delegates all storage reads to `ERC1410StorageWrapper`. Intended to be
 *         inherited solely by `OperatorFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract Operator is IOperator, Modifiers {
    /// @inheritdoc IOperator
    function initializeOperator()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_OPERATOR)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_OPERATOR);
        emit OperatorInitialized();
    }

    /// @inheritdoc IOperator
    function authorizeOperator(
        address _operator
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyCompliant(EvmAccessors.getMsgSender(), _operator, false)
    {
        ERC1410StorageWrapper.authorizeOperator(_operator);
    }

    /// @inheritdoc IOperator
    function revokeOperator(
        address _operator
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyIdentifiedAddresses(EvmAccessors.getMsgSender(), _operator)
        onlyCompliant(EvmAccessors.getMsgSender(), _operator, false)
    {
        ERC1410StorageWrapper.revokeOperator(_operator);
    }

    /// @inheritdoc IOperator
    function isOperator(address _operator, address _tokenHolder) external view override returns (bool) {
        return ERC1410StorageWrapper.isOperator(_operator, _tokenHolder);
    }
}
