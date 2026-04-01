// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE, _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { IERC3643Batch } from "./IERC3643Batch.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { IERC1644StorageWrapper } from "../../../domain/asset/ERC1400/ERC1644/IERC1644StorageWrapper.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../domain/asset/ERC1644StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC3643Batch is IERC3643Batch, TimestampProvider, Modifiers {
    function batchTransfer(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
    {
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1594StorageWrapper.requireIdentified(msg.sender, address(0));
        ERC1594StorageWrapper.requireCompliant(msg.sender, address(0), false);
        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(address(0), _toList[i], false);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            TokenCoreOps.transfer(msg.sender, _toList[i], _amounts[i]);
        }
    }

    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        override
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_fromList, _amounts)
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyControllable
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _fromList.length; i++) {
            TokenCoreOps.transfer(_fromList[i], _toList[i], _amounts[i]);
            emit IERC1644StorageWrapper.ControllerTransfer(msg.sender, _fromList[i], _toList[i], _amounts[i], "", "");
        }
    }

    function batchMint(
        address[] calldata _toList,
        uint256[] calldata _amounts
    ) external onlyUnpaused onlyValidInputAmountsArrayLength(_toList, _amounts) onlyWithoutMultiPartition {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(address(0), _toList[i], false);
            CapStorageWrapper.requireWithinMaxSupply(_amounts[i], _getBlockTimestamp());
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.issue(_toList[i], _amounts[i], "");
        }
    }

    function batchBurn(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    )
        external
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_userAddresses, _amounts)
        onlyWithoutMultiPartition
        onlyControllable
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            TokenCoreOps.burn(_userAddresses[i], _amounts[i]);
            emit IERC1644StorageWrapper.ControllerRedemption(msg.sender, _userAddresses[i], _amounts[i], "", "");
        }
    }
}
