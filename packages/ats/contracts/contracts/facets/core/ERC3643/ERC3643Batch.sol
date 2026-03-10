// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Batch } from "../ERC3643/IERC3643Batch.sol";
import { IERC3643Management } from "../ERC3643/IERC3643Management.sol";
import { IERC1644Base } from "../ERC1400/ERC1644/IERC1644Base.sol";
import { IERC1594 } from "../ERC1400/ERC1594/IERC1594.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../domain/asset/ERC1644StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";

abstract contract ERC3643Batch is IERC3643Batch, TimestampProvider {
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external override {
        if (_toList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        PauseStorageWrapper.requireNotPaused();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkIdentity(msg.sender, address(0));
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, address(0), false);

        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(msg.sender, address(0), _toList[i], false);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            TokenCoreOps.transfer(msg.sender, _toList[i], _amounts[i], _getBlockTimestamp(), _getBlockNumber());
        }
    }

    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    ) external override {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ERC1644StorageWrapper.checkControllable();
        PauseStorageWrapper.requireNotPaused();
        if (_fromList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        if (_toList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _fromList.length; i++) {
            TokenCoreOps.transfer(_fromList[i], _toList[i], _amounts[i], _getBlockTimestamp(), _getBlockNumber());
            emit IERC1644Base.ControllerTransfer(msg.sender, _fromList[i], _toList[i], _amounts[i], "", "");
        }
    }

    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external override {
        if (_toList.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(msg.sender, address(0), _toList[i], false);
            CapStorageWrapper.requireWithinMaxSupply(_amounts[i], ERC1410StorageWrapper.totalSupply());
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            TokenCoreOps.mint(_toList[i], _amounts[i], _getBlockTimestamp(), _getBlockNumber());
            emit IERC1594.Issued(msg.sender, _toList[i], _amounts[i], "");
        }
    }

    function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external override {
        PauseStorageWrapper.requireNotPaused();
        if (_userAddresses.length != _amounts.length) revert IERC3643Management.InputAmountsArrayLengthMismatch();
        ERC1644StorageWrapper.checkControllable();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            TokenCoreOps.burn(_userAddresses[i], _amounts[i], _getBlockTimestamp(), _getBlockNumber());
            emit IERC1644Base.ControllerRedemption(msg.sender, _userAddresses[i], _amounts[i], "", "");
        }
    }
}
