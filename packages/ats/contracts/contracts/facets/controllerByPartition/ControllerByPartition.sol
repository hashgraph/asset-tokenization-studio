// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControllerByPartition } from "./IControllerByPartition.sol";
import { CONTROLLER_ROLE, AGENT_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ControllerByPartition
 * @notice Abstract implementation of controller-initiated forced transfers and redemptions on a
 *         specific partition. Delegates into `TokenCoreOps` so semantics match `ERC1410Management`
 *         exactly.
 * @dev Inherits modifier guards from `Modifiers`. Intended to be used only through
 *      `ControllerByPartitionFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract ControllerByPartition is IControllerByPartition, Modifiers {
    /// @inheritdoc IControllerByPartition
    /// @dev Emits {TransferByPartition} via TokenCoreOps.transferByPartition.
    function controllerTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyControllable
        onlyAnyRole(_buildRoles(CONTROLLER_ROLE, AGENT_ROLE))
        returns (bytes32)
    {
        return
            TokenCoreOps.transferByPartition(
                _from,
                IERC1410Types.BasicTransferInfo(_to, _value),
                _partition,
                _data,
                EvmAccessors.getMsgSender(),
                _operatorData
            );
    }

    /// @inheritdoc IControllerByPartition
    /// @dev Emits {RedeemedByPartition} via TokenCoreOps.redeemByPartition.
    function controllerRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyControllable
        onlyAnyRole(_buildRoles(CONTROLLER_ROLE, AGENT_ROLE))
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
}
