// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";
import { IERC3643Batch } from "./IERC3643Batch.sol";
import { IController } from "../../controller/IController.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ERC3643Batch is IERC3643Batch, Modifiers {
    function batchTransfer(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyClearingDisabled
        onlyIdentifiedAddresses(EvmAccessors.getMsgSender(), address(0))
        onlyCompliant(EvmAccessors.getMsgSender(), address(0), false)
    {
        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(address(0), _toList[i], false);
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            TokenCoreOps.transfer(EvmAccessors.getMsgSender(), _toList[i], _amounts[i]);
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
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        for (uint256 i = 0; i < _fromList.length; i++) {
            TokenCoreOps.transfer(_fromList[i], _toList[i], _amounts[i]);
            emit IController.ControllerTransfer(
                EvmAccessors.getMsgSender(),
                _fromList[i],
                _toList[i],
                _amounts[i],
                "",
                ""
            );
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
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.checkIdentity(address(0), _toList[i]);
            ERC1594StorageWrapper.checkCompliance(address(0), _toList[i], false);
            CapStorageWrapper.requireWithinMaxSupply(_amounts[i], TimeTravelStorageWrapper.getBlockTimestamp());
        }
        for (uint256 i = 0; i < _toList.length; i++) {
            ERC1594StorageWrapper.issue(_toList[i], _amounts[i], "");
        }
    }
}
