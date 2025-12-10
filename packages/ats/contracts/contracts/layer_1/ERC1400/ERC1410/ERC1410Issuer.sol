// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _ISSUER_ROLE } from "../../constants/roles.sol";
import { IERC1410Issuer } from "../../interfaces/ERC1400/IERC1410Issuer.sol";
import { Common } from "../../../layer_0/common/Common.sol";
import { IssueData } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";

abstract contract ERC1410Issuer is IERC1410Issuer, Common {
    function issueByPartition(
        IssueData calldata _issueData
    )
        external
        onlyUnpaused
        onlyIssuable
        onlyWithinMaxSupply(_issueData.value)
        onlyWithinMaxSupplyByPartition(_issueData.partition, _issueData.value)
        onlyDefaultPartitionWithSinglePartition(_issueData.partition)
        onlyIdentified(address(0), _issueData.tokenHolder)
        onlyCompliant(address(0), _issueData.tokenHolder, false)
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
            _checkRecoveredAddress(_msgSender());
        }
        _issueByPartition(_issueData);
    }
}
