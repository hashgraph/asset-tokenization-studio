// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../constants/roles.sol";
import { IERC3643Operations } from "../interfaces/ERC3643/IERC3643Operations.sol";
import { Common } from "../../layer_0/common/Common.sol";

abstract contract ERC3643Operations is IERC3643Operations, Common {
    function burn(
        address _userAddress,
        uint256 _amount
    ) external onlyUnpaused onlyControllable onlyWithoutMultiPartition {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _controllerRedeem(_userAddress, _amount, "", "");
    }

    function mint(
        address _to,
        uint256 _amount
    )
        external
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyWithinMaxSupply(_amount)
        onlyIdentified(address(0), _to)
        onlyCompliant(address(0), _to, false)
        onlyIssuable
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _issue(_to, _amount, "");
    }

    function forcedTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external onlyWithoutMultiPartition onlyControllable onlyUnpaused returns (bool) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _controllerTransfer(_from, _to, _amount, "", "");
        return true;
    }
}
