// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Batch } from "../interfaces/ERC3643/IERC3643Batch.sol";
import { IERC3643Management } from "../interfaces/ERC3643/IERC3643Management.sol";
import { IERC1644Base } from "../interfaces/ERC1400/IERC1644Base.sol";
import { IERC1594 } from "../interfaces/ERC1400/IERC1594.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCap } from "../../../lib/core/LibCap.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../lib/domain/LibERC1594.sol";
import { LibERC1644 } from "../../../lib/domain/LibERC1644.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { TokenCoreOps } from "../../../lib/orchestrator/TokenCoreOps.sol";
import { LibTimeTravel } from "../../../test/timeTravel/LibTimeTravel.sol";
import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";

abstract contract ERC3643Batch is IERC3643Batch {
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external override {
        if (_toList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        LibPause.requireNotPaused();
        if (LibClearing.isClearingActivated()) revert IClearing.ClearingIsActivated();
        LibERC1410.checkWithoutMultiPartition();
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkIdentity(msg.sender, address(0));
        LibERC1594.checkCompliance(msg.sender, msg.sender, address(0), false);

        for (uint256 i = 0; i < _toList.length; i++) {
            LibERC1594.checkIdentity(address(0), _toList[i]);
            LibERC1594.checkCompliance(msg.sender, address(0), _toList[i], false);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            TokenCoreOps.transfer(msg.sender, _toList[i], _amounts[i], LibTimeTravel.getBlockTimestamp());
        }
    }

    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    ) external override {
        LibERC1410.checkWithoutMultiPartition();
        LibERC1644.checkControllable();
        LibPause.requireNotPaused();
        if (_fromList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        if (_toList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _fromList.length; i++) {
            TokenCoreOps.transfer(_fromList[i], _toList[i], _amounts[i], LibTimeTravel.getBlockTimestamp());
            emit IERC1644Base.ControllerTransfer(msg.sender, _fromList[i], _toList[i], _amounts[i], "", "");
        }
    }

    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external override {
        if (_toList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            LibERC1594.checkIdentity(address(0), _toList[i]);
            LibERC1594.checkCompliance(msg.sender, address(0), _toList[i], false);
            LibCap.requireWithinMaxSupply(_amounts[i], LibERC1410.totalSupply());
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            TokenCoreOps.mint(_toList[i], _amounts[i], LibTimeTravel.getBlockTimestamp());
            emit IERC1594.Issued(msg.sender, _toList[i], _amounts[i], "");
        }
    }

    function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external override {
        LibPause.requireNotPaused();
        if (_userAddresses.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        LibERC1644.checkControllable();
        LibERC1410.checkWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            TokenCoreOps.burn(_userAddresses[i], _amounts[i], LibTimeTravel.getBlockTimestamp());
            emit IERC1644Base.ControllerRedemption(msg.sender, _userAddresses[i], _amounts[i], "", "");
        }
    }
}
