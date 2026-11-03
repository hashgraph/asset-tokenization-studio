// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedByPartition, RESOLVER_KEY_PROTECTED_BY_PARTITION } from "./IProtectedByPartition.sol";
import { IProtectedPartitions } from "../protectedPartitions/IProtectedPartitions.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

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
    function initializeProtectedByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PROTECTED_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PROTECTED_BY_PARTITION);
        emit ProtectedByPartitionInitialized();
    }

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
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyPositiveTransferAmount(_amount)
        onlyCanTransferFromByPartition(_from, _to, _partition, _amount)
        returns (bytes32)
    {
        _emitProtectedTransferredByPartition(_from, _to, _amount, _partition, _protectionData);

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
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanRedeemFromByPartition(_from, _partition, _amount)
    {
        TokenCoreOps.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);

        emit ProtectedRedeemedByPartition(EvmAccessors.getMsgSender(), _from, _amount, _partition, _protectionData);
    }

    /**
     * @notice Emits {ProtectedTransferredByPartition} for a protected partition transfer.
     * @dev Extracted to its own stack frame — `protectedTransferFromByPartition`'s modifier
     *      list plus this emit's argument count exceeds Solidity's 16-slot stack window
     *      (legacy codegen, no viaIR).
     * @param _from The token holder whose balance is debited.
     * @param _to The recipient credited with the transferred amount.
     * @param _amount The transferred amount.
     * @param _partition The partition the transfer is executed on.
     * @param _protectionData The EIP-712 protection signature data authorising the transfer.
     */
    function _emitProtectedTransferredByPartition(
        address _from,
        address _to,
        uint256 _amount,
        bytes32 _partition,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) private {
        emit ProtectedTransferredByPartition(
            EvmAccessors.getMsgSender(),
            _from,
            _to,
            _amount,
            _partition,
            _protectionData
        );
    }
}
