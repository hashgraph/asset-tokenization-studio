// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";
import { IERC1410Types } from "./IERC1410Types.sol";
import { IERC1410Management } from "./IERC1410Management.sol";
import { IProtectedPartitions } from "../../../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ERC1410Management is IERC1410Management, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external override onlyNotERC1410Initialized {
        ERC1410StorageWrapper.initialize_ERC1410(_multiPartition);
    }

    function controllerTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyControllable
        returns (bytes32)
    {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _CONTROLLER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        return
            TokenCoreOps.transferByPartition(
                _from,
                IERC1410Types.BasicTransferInfo(_to, _value),
                _partition,
                _data,
                EvmAccessors.getMsgSender(),
                _operatorData
            );
    }

    function controllerRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyDefaultPartitionWithSinglePartition(_partition) onlyControllable {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _CONTROLLER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        TokenCoreOps.redeemByPartition(
            _partition,
            _tokenHolder,
            EvmAccessors.getMsgSender(),
            _value,
            _data,
            _operatorData
        );
    }

    function operatorTransferByPartition(
        IERC1410Types.OperatorTransferData calldata _operatorTransferData
    )
        external
        override
        notZeroAddress(_operatorTransferData.to)
        onlyDefaultPartitionWithSinglePartition(_operatorTransferData.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(
            _operatorTransferData.from,
            _operatorTransferData.to,
            _operatorTransferData.partition,
            _operatorTransferData.value
        )
        onlyOperator(_operatorTransferData.partition, _operatorTransferData.from)
        returns (bytes32)
    {
        return TokenCoreOps.operatorTransferByPartition(_operatorTransferData);
    }

    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_tokenHolder, _partition, _value)
        onlyOperator(_partition, _tokenHolder)
    {
        TokenCoreOps.redeemByPartition(
            _partition,
            _tokenHolder,
            EvmAccessors.getMsgSender(),
            _value,
            _data,
            _operatorData
        );
    }

    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanTransferFromByPartition(_from, _to, _partition, _amount)
        returns (bytes32)
    {
        return TokenCoreOps.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanRedeemFromByPartition(_from, _partition, _amount)
    {
        TokenCoreOps.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }
}
