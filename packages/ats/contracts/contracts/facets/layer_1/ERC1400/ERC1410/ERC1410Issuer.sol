// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AGENT_ROLE, ISSUER_ROLE } from "../../../../constants/roles.sol";
import { IERC1410Issuer } from "./IERC1410Issuer.sol";
import { IERC1410Types } from "./IERC1410Types.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimeTravelStorageWrapper } from "../../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ERC1410Issuer
 * @notice Facet for issuing tokens by partition (ERC-1410 standard)
 * @dev Validates all pre-conditions before issuing tokens including:
 *      - Caller has ISSUER_ROLE or AGENT_ROLE
 *      - Token is not paused
 *      - Addresses are not recovered
 *      - Partition is valid
 *      - Supply limits are respected
 *      - Compliance rules are met
 */
abstract contract ERC1410Issuer is IERC1410Issuer, Modifiers {
    /**
     * @notice Issues tokens to a specific partition for a token holder
     * @param _issueData The issue data containing partition, token holder, value, and data
     * @dev Requires caller to have ISSUER_ROLE or AGENT_ROLE
     * @dev Emits IssuedByPartition event on success
     */
    function issueByPartition(
        IERC1410Types.IssueData calldata _issueData
    )
        external
        onlyUnpaused
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
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ISSUER_ROLE;
        roles[1] = AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        TokenCoreOps.issueByPartition(_issueData);
    }
}
