// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _ISSUER_ROLE } from "../../../../constants/roles.sol";
import { IERC1410Issuer } from "./IERC1410Issuer.sol";
import { IERC1410Types } from "./IERC1410Types.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../../../domain/core/CapStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ERC1410Issuer is IERC1410Issuer, TimestampProvider, Modifiers {
    function issueByPartition(
        IERC1410Types.IssueData calldata _issueData
    )
        external
        onlyUnpaused
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyDefaultPartitionWithSinglePartition(_issueData.partition)
        onlyWithinMaxSupply(_issueData.value, _getBlockTimestamp())
        onlyWithinMaxSupplyByPartition(_issueData.partition, _issueData.value, _getBlockTimestamp())
        onlyIdentifiedAddresses(address(0), _issueData.tokenHolder)
        onlyCompliant(address(0), _issueData.tokenHolder, false)
    {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _ISSUER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        TokenCoreOps.issueByPartition(_issueData);
    }
}
