// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ITransfer} from "./ITransfer.sol";
import { IERC1594 } from "../layer_1/ERC1400/ERC1594/IERC1594.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

abstract contract Transfer is ITransfer, Modifiers {
    /// @inheritdoc ITransfer
    function transfer(
        address to,
        uint256 amount
    )
        external
        override
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
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(EvmAccessors.getMsgSender(), _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transfer(EvmAccessors.getMsgSender(), _to, _value);
        emit IERC1594.TransferWithData(EvmAccessors.getMsgSender(), _to, _value, _data);
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
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_to)
        onlyUnrecoveredAddress(_from)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(_from, _to, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.transferFrom(msg.sender, _from, _to, _value);
        emit IERC1594.TransferFromWithData(msg.sender, _from, _to, _value, _data);
    }
}
