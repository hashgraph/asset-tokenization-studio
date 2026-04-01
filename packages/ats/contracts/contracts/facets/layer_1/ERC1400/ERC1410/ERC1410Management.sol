// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _AGENT_ROLE, _WILD_CARD_ROLE } from "../../../../constants/roles.sol";
import { BasicTransferInfo, OperatorTransferData } from "./IERC1410.sol";
import { IERC1410Management } from "./IERC1410Management.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { _checkNotInitialized } from "../../../../services/InitializationErrors.sol";
import { ERC1644StorageWrapper } from "../../../../domain/asset/ERC1644StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";

abstract contract ERC1410Management is IERC1410Management, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external override {
        _checkNotInitialized(ERC1410StorageWrapper.isERC1410Initialized());
        ERC1410StorageWrapper.initialize_ERC1410(_multiPartition);
    }

    function controllerTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyDefaultPartitionWithSinglePartition(_partition) returns (bytes32) {
        ERC1644StorageWrapper.requireControllable();
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _CONTROLLER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        return
            TokenCoreOps.transferByPartition(
                _from,
                BasicTransferInfo(_to, _value),
                _partition,
                _data,
                msg.sender,
                _operatorData
            );
    }

    function controllerRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyDefaultPartitionWithSinglePartition(_partition) {
        ERC1644StorageWrapper.requireControllable();
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _CONTROLLER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        TokenCoreOps.redeemByPartition(_partition, _tokenHolder, msg.sender, _value, _data, _operatorData);
    }

    function operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    )
        external
        override
        notZeroAddress(_operatorTransferData.to)
        onlyDefaultPartitionWithSinglePartition(_operatorTransferData.partition)
        returns (bytes32)
    {
        ERC1410StorageWrapper.requireOperator(_operatorTransferData.partition, _operatorTransferData.from);
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.requireCanTransferFromByPartition(
            _operatorTransferData.from,
            _operatorTransferData.to,
            _operatorTransferData.partition,
            _operatorTransferData.value
        );
        return TokenCoreOps.operatorTransferByPartition(_operatorTransferData);
    }

    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyDefaultPartitionWithSinglePartition(_partition) {
        ERC1410StorageWrapper.requireOperator(_partition, _tokenHolder);
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.requireCanRedeemFromByPartition(_tokenHolder, _partition, _value);
        TokenCoreOps.redeemByPartition(_partition, _tokenHolder, msg.sender, _value, _data, _operatorData);
    }

    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        returns (bytes32)
    {
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        ERC1594StorageWrapper.requireCanTransferFromByPartition(_from, _to, _partition, _amount);
        return TokenCoreOps.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) external override onlyUnpaused onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition)) {
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        ERC1594StorageWrapper.requireCanRedeemFromByPartition(_from, _partition, _amount);
        TokenCoreOps.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
