// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { BasicTransferInfo, OperatorTransferData } from "../../interfaces/ERC1400/IERC1410.sol";
import { IERC1410Management } from "../../interfaces/ERC1400/IERC1410Management.sol";
import { Internals } from "../../../layer_0/Internals.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";

abstract contract ERC1410Management is IERC1410Management, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external override onlyUninitialized(_isERC1410Initialized()) {
        _initialize_ERC1410(_multiPartition);
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
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        return
            _transferByPartition(_from, BasicTransferInfo(_to, _value), _partition, _data, _msgSender(), _operatorData);
    }

    function controllerRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyDefaultPartitionWithSinglePartition(_partition) onlyControllable {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _redeemByPartition(_partition, _tokenHolder, _msgSender(), _value, _data, _operatorData);
    }

    function operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_operatorTransferData.partition)
        onlyOperator(_operatorTransferData.partition, _operatorTransferData.from)
        onlyUnProtectedPartitionsOrWildCardRole
        validateAddress(_operatorTransferData.to)
        onlyCanTransferFromByPartition(
            _operatorTransferData.from,
            _operatorTransferData.to,
            _operatorTransferData.partition,
            _operatorTransferData.value,
            _operatorTransferData.data,
            _operatorTransferData.operatorData
        )
        returns (bytes32)
    {
        return _operatorTransferByPartition(_operatorTransferData);
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
        onlyOperator(_partition, _tokenHolder)
        onlyUnProtectedPartitionsOrWildCardRole
    {
        {
            _checkCanRedeemFromByPartition(_tokenHolder, _partition, _value, _data, _operatorData);
        }
        _redeemByPartition(_partition, _tokenHolder, _msgSender(), _value, _data, _operatorData);
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
        onlyRole(_protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanTransferFromByPartition(_from, _to, _partition, _amount, "", "")
        returns (bytes32)
    {
        return _protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    )
        external
        override
        onlyRole(_protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanRedeemFromByPartition(_from, _partition, _amount, "", "")
    {
        _protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }
}
