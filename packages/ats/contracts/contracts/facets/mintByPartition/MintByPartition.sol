// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AGENT_ROLE, ISSUER_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IMintByPartition } from "./IMintByPartition.sol";
import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

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
    function issueByPartition(
        IERC1410Types.IssueData calldata _issueData
    )
        external
        override
        onlyUnpaused
        onlyAnyRole(_buildRoles(ISSUER_ROLE, AGENT_ROLE))
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyDefaultPartitionWithSinglePartition(_issueData.partition)
        onlyWithinMaxSupply(_issueData.value, TimeTravelStorageWrapper.getBlockTimestamp())
        onlyWithinMaxSupplyByPartition(
            _issueData.partition,
            _issueData.value,
            TimeTravelStorageWrapper.getBlockTimestamp()
        )
        onlyIdentifiedAddresses(address(0), _issueData.tokenHolder)
        onlyCompliant(address(0), _issueData.tokenHolder, false)
    {
        TokenCoreOps.issueByPartition(_issueData);
    }
}
