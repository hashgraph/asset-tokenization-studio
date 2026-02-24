// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Operations } from "../interfaces/ERC3643/IERC3643Operations.sol";
import { IERC1644Base } from "../interfaces/ERC1400/IERC1644Base.sol";
import { IERC1594 } from "../interfaces/ERC1400/IERC1594.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCap } from "../../../lib/core/LibCap.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../lib/domain/LibERC1594.sol";
import { LibERC1644 } from "../../../lib/domain/LibERC1644.sol";
import { TokenCoreOps } from "../../../lib/orchestrator/TokenCoreOps.sol";
import { LibTimeTravel } from "../../../test/timeTravel/LibTimeTravel.sol";
import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";

abstract contract ERC3643Operations is IERC3643Operations {
    function burn(address _userAddress, uint256 _amount) external override {
        LibPause.requireNotPaused();
        LibERC1644.checkControllable();
        LibERC1410.checkWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.burn(_userAddress, _amount, LibTimeTravel.getBlockTimestamp());
        emit IERC1644Base.ControllerRedemption(msg.sender, _userAddress, _amount, "", "");
    }

    function mint(address _to, uint256 _amount) external override {
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        LibCap.requireWithinMaxSupply(_amount, LibERC1410.totalSupply());
        LibERC1594.checkIdentity(address(0), _to);
        LibERC1594.checkCompliance(msg.sender, address(0), _to, false);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.mint(_to, _amount, LibTimeTravel.getBlockTimestamp());
        emit IERC1594.Issued(msg.sender, _to, _amount, "");
    }

    function forcedTransfer(address _from, address _to, uint256 _amount) external override returns (bool) {
        LibERC1410.checkWithoutMultiPartition();
        LibERC1644.checkControllable();
        LibPause.requireNotPaused();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.transfer(_from, _to, _amount, LibTimeTravel.getBlockTimestamp());
        emit IERC1644Base.ControllerTransfer(msg.sender, _from, _to, _amount, "", "");
        return true;
    }
}
