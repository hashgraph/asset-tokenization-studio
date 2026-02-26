// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Issuer } from "../../interfaces/ERC1400/IERC1410Issuer.sol";
import { IControlListBase } from "../../interfaces/controlList/IControlListBase.sol";
import { IssueData } from "../../interfaces/ERC1400/IERC1410Types.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibCap } from "../../../../lib/core/LibCap.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibCompliance } from "../../../../lib/core/LibCompliance.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../../lib/domain/LibERC1594.sol";
import { TokenCoreOps } from "../../../../lib/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/lib/TimestampProvider.sol";
import { _ISSUER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1410Issuer is IERC1410Issuer, IControlListBase, TimestampProvider {
    function issueByPartition(IssueData calldata _issueData) external override {
        LibPause.requireNotPaused();
        LibCap.requireWithinMaxSupply(_issueData.value, LibERC1410.totalSupply());
        LibCap.requireWithinMaxSupplyByPartition(
            _issueData.partition,
            _issueData.value,
            LibERC1410.totalSupplyByPartition(_issueData.partition)
        );
        LibERC1410.checkDefaultPartitionWithSinglePartition(_issueData.partition);
        LibERC1594.checkIdentity(address(0), _issueData.tokenHolder);
        LibERC1594.checkCompliance(msg.sender, address(0), _issueData.tokenHolder, false);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
            LibCompliance.requireNotRecovered(msg.sender);
        }
        TokenCoreOps.issueByPartition(_issueData, _getBlockTimestamp(), _getBlockNumber());
    }
}
