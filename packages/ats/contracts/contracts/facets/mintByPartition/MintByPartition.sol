// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_AGENT, ROLE_ISSUER, _buildRoles } from "../../constants/roles.sol";
import { IMintByPartition, RESOLVER_KEY_MINT_BY_PARTITION } from "./IMintByPartition.sol";
import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title MintByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the partition-aware token issuance operation.
 * @dev Implements `issueByPartition` on top of `TokenCoreOps`. The entry point enforces
 *      the issuer-or-agent access-control matrix, unpaused state, address recovery check,
 *      partition validity, per-partition and global supply ceilings, and identity and
 *      compliance checks before delegating to the orchestrator library.
 */
abstract contract MintByPartition is IMintByPartition, Modifiers {
    /// @inheritdoc IMintByPartition
    function initializeMintByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_MINT_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_MINT_BY_PARTITION);
        emit MintByPartitionInitialized();
    }

    /// @inheritdoc IMintByPartition
    function issueByPartition(
        IERC1410Types.IssueData calldata _issueData
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyAnyRole(_buildRoles(ROLE_ISSUER, ROLE_AGENT))
        onlyDefaultPartitionWithSinglePartition(_issueData.partition)
        onlyWithinMaxSupply(_issueData.value, EvmAccessors.getBlockTimestamp())
        onlyWithinMaxSupplyByPartition(_issueData.partition, _issueData.value, EvmAccessors.getBlockTimestamp())
        onlyIdentifiedAddresses(address(0), _issueData.tokenHolder)
        onlyCompliant(EvmAccessors.getMsgSender(), _issueData.tokenHolder, false)
    {
        TokenCoreOps.issueByPartition(_issueData);
    }
}
