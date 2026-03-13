// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _ISSUER_ROLE } from "../../../../constants/roles.sol";
import { IERC1410Issuer } from "./IERC1410Issuer.sol";
import { IssueData } from "./IERC1410.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { CapStorageWrapper } from "../../../../domain/core/CapStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC1410Issuer is IERC1410Issuer, TimestampProvider {
    function issueByPartition(IssueData calldata _issueData) external {
        PauseStorageWrapper.requireNotPaused();
        CapStorageWrapper.requireWithinMaxSupply(_issueData.value, _getBlockTimestamp());
        CapStorageWrapper.requireWithinMaxSupplyByPartition(
            _issueData.partition,
            _issueData.value,
            _getBlockTimestamp()
        );
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_issueData.partition);
        ERC1594StorageWrapper.requireIdentified(address(0), _issueData.tokenHolder);
        ERC1594StorageWrapper.requireCompliant(address(0), _issueData.tokenHolder, false);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
            ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender);
        }
        TokenCoreOps.issueByPartition(_issueData);
    }
}
