// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransferFacet } from "./ITransferFacet.sol";
import { IERC1594 } from "../layer_1/ERC1400/ERC1594/IERC1594.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Transfer
 * @notice Abstract implementation of ERC-20 style and ERC-1594 data-bearing token transfers.
 * @dev Consolidates `transfer`, `transferFrom`, `transferWithData`, and `transferFromWithData`
 *      in a single abstract contract. All four methods are restricted to single-partition mode.
 *      `transfer` and `transferFrom` additionally require the token to be unpaused. The
 *      `transferFromWithData` method validates that neither the operator, recipient, nor sender
 *      is a recovered address. All compliance and identity checks are enforced by the
 *      `onlyCanTransferFromByPartition` modifier chain.
 */
abstract contract Transfer is ITransferFacet, Modifiers {
    /**
     * @notice Moves `amount` tokens from the caller to `to`.
     * @param to     Recipient address.
     * @param amount Number of tokens to transfer.
     * @return True if the transfer succeeded.
     */
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

    /**
     * @notice Moves `amount` tokens from `from` to `to` using the caller's allowance.
     * @param from   Source address.
     * @param to     Destination address.
     * @param amount Number of tokens to transfer.
     * @return True if the transfer succeeded.
     */
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

    /**
     * @notice Transfers tokens to `_to` with additional `_data` attached.
     * @dev Only available in single-partition mode. No pause check — same behaviour as ERC-1594.
     * @param _to    Recipient address.
     * @param _value Amount of tokens to transfer.
     * @param _data  Arbitrary data attached to the transfer.
     */
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

    /**
     * @notice Transfers tokens from `_from` to `_to` with additional `_data` attached.
     * @dev Caller must have a sufficient allowance. Only available in single-partition mode.
     *      No pause check — same behaviour as ERC-1594.
     * @param _from  Source address.
     * @param _to    Destination address.
     * @param _value Amount of tokens to transfer.
     * @param _data  Arbitrary data attached to the transfer.
     */
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
