// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IOperatorByPartition } from "./IOperatorByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title  OperatorByPartition
 * @notice Abstract implementation of `IOperatorByPartition`.
 * @dev    Storage reads and writes delegate to `ERC1410StorageWrapper`. Token-lifecycle
 *         operations (operator transfer and redemption) are orchestrated via `TokenCoreOps`.
 *         Intended to be inherited solely by `OperatorByPartitionFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract OperatorByPartition is IOperatorByPartition, Modifiers {
    /// @inheritdoc IOperatorByPartition
    /// @dev Emits {AuthorizedOperatorByPartition} via
    ///      ERC1410StorageWrapper.authorizeOperatorByPartition.
    function authorizeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyCompliant(EvmAccessors.getMsgSender(), _operator, false)
    {
        ERC1410StorageWrapper.authorizeOperatorByPartition(_partition, _operator);
    }

    /// @inheritdoc IOperatorByPartition
    /// @dev Emits {RevokedOperatorByPartition} via
    ///      ERC1410StorageWrapper.revokeOperatorByPartition.
    function revokeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyIdentifiedAddresses(EvmAccessors.getMsgSender(), _operator)
        onlyCompliant(EvmAccessors.getMsgSender(), _operator, false)
    {
        ERC1410StorageWrapper.revokeOperatorByPartition(_partition, _operator);
    }

    /// @inheritdoc IOperatorByPartition
    /// @dev Emits {TransferByPartition} via TokenCoreOps.operatorTransferByPartition.
    function operatorTransferByPartition(
        IERC1410Types.OperatorTransferData calldata _operatorTransferData
    )
        external
        override
        onlyAddressNotZero(_operatorTransferData.to)
        onlyDefaultPartitionWithSinglePartition(_operatorTransferData.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(
            _operatorTransferData.from,
            _operatorTransferData.to,
            _operatorTransferData.partition,
            _operatorTransferData.value
        )
        onlyOperator(_operatorTransferData.partition, _operatorTransferData.from)
        returns (bytes32)
    {
        return TokenCoreOps.operatorTransferByPartition(_operatorTransferData);
    }

    /// @inheritdoc IOperatorByPartition
    /// @dev Emits {RedeemedByPartition} via TokenCoreOps.redeemByPartition.
    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_tokenHolder, _partition, _value)
        onlyOperator(_partition, _tokenHolder)
    {
        TokenCoreOps.redeemByPartition(
            _partition,
            _tokenHolder,
            EvmAccessors.getMsgSender(),
            _value,
            _data,
            _operatorData
        );
    }

    /// @inheritdoc IOperatorByPartition
    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) public view override returns (bool) {
        return ERC1410StorageWrapper.isOperatorForPartition(_partition, _operator, _tokenHolder);
    }
}
