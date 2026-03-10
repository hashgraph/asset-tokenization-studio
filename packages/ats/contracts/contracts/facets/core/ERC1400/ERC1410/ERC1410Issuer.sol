// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Issuer } from "../../ERC1400/ERC1410/IERC1410Issuer.sol";
import { IControlListBase } from "../../controlList/IControlListBase.sol";
import { IssueData } from "../../ERC1400/ERC1410/IERC1410Types.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { CapStorageWrapper } from "../../../../domain/core/CapStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../../domain/core/ComplianceStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { _ISSUER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1410Issuer is IERC1410Issuer, IControlListBase, TimestampProvider {
    function issueByPartition(IssueData calldata _issueData) external override {
        PauseStorageWrapper.requireNotPaused();
        CapStorageWrapper.requireWithinMaxSupply(_issueData.value, ERC1410StorageWrapper.totalSupply());
        CapStorageWrapper.requireWithinMaxSupplyByPartition(
            _issueData.partition,
            _issueData.value,
            ERC1410StorageWrapper.totalSupplyByPartition(_issueData.partition)
        );
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_issueData.partition);
        ERC1594StorageWrapper.checkIdentity(address(0), _issueData.tokenHolder);
        ERC1594StorageWrapper.checkCompliance(msg.sender, address(0), _issueData.tokenHolder, false);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
            ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        }
        TokenCoreOps.issueByPartition(_issueData, _getBlockTimestamp(), _getBlockNumber());
    }
}
