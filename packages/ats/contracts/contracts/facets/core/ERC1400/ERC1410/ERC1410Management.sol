// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management } from "../../ERC1400/ERC1410/IERC1410Management.sol";
import { IControlListBase } from "../../controlList/IControlListBase.sol";
import { IERC1644Base } from "../../ERC1400/ERC1644/IERC1644Base.sol";
import { IProtectedPartitions } from "../../protectedPartition/IProtectedPartitions.sol";
import { BasicTransferInfo, OperatorTransferData } from "../../ERC1400/ERC1410/IERC1410Types.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../../domain/asset/ERC1644StorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { NonceStorageWrapper } from "../../../../domain/core/NonceStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../../../infrastructure/proxy/ResolverProxyStorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../../domain/asset/ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { ERC712 } from "../../../../domain/core/ERC712.sol";
import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1410Management is IERC1410Management, IControlListBase, IERC1644Base, TimestampProvider {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external override {
        if (ERC1410StorageWrapper.isInitialized()) revert AlreadyInitialized();
        ERC1410StorageWrapper.initialize(_multiPartition);
    }

    function controllerTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override returns (bytes32) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ERC1644StorageWrapper.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        return
            TokenCoreOps.transferByPartition(
                _from,
                BasicTransferInfo(_to, _value),
                _partition,
                _data,
                msg.sender,
                _operatorData,
                _getBlockTimestamp(),
                _getBlockNumber()
            );
    }

    function controllerRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ERC1644StorageWrapper.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.redeemByPartition(
            _partition,
            _tokenHolder,
            msg.sender,
            _value,
            _data,
            _operatorData,
            _getBlockTimestamp(),
            _getBlockNumber()
        );
    }

    function operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    ) external override returns (bytes32) {
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_operatorTransferData.partition);
        ERC1410StorageWrapper.checkOperator(_operatorTransferData.partition, msg.sender, _operatorTransferData.from);
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1410StorageWrapper.requireValidAddress(_operatorTransferData.to);
        ERC1594StorageWrapper.checkCanTransferFromByPartition(
            msg.sender,
            _operatorTransferData.from,
            _operatorTransferData.to,
            _operatorTransferData.partition,
            _operatorTransferData.value,
            _getBlockTimestamp()
        );
        return
            TokenCoreOps.transferByPartition(
                _operatorTransferData.from,
                BasicTransferInfo(_operatorTransferData.to, _operatorTransferData.value),
                _operatorTransferData.partition,
                _operatorTransferData.data,
                msg.sender,
                _operatorTransferData.operatorData,
                _getBlockTimestamp(),
                _getBlockNumber()
            );
    }

    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ERC1410StorageWrapper.checkOperator(_partition, msg.sender, _tokenHolder);
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanRedeemFromByPartition(
            msg.sender,
            _tokenHolder,
            _partition,
            _value,
            _getBlockTimestamp()
        );
        TokenCoreOps.redeemByPartition(
            _partition,
            _tokenHolder,
            msg.sender,
            _value,
            _data,
            _operatorData,
            _getBlockTimestamp(),
            _getBlockNumber()
        );
    }

    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external override returns (bytes32) {
        AccessStorageWrapper.checkRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition),
            msg.sender
        );
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        ERC1594StorageWrapper.checkCanTransferFromByPartition(
            msg.sender,
            _from,
            _to,
            _partition,
            _amount,
            _getBlockTimestamp()
        );
        ERC712.checkNounceAndDeadline(
            _protectionData.nounce,
            _from,
            NonceStorageWrapper.getNonceFor(_from),
            _protectionData.deadline,
            _getBlockTimestamp()
        );
        ProtectedPartitionsStorageWrapper.checkTransferSignature(
            _partition,
            _from,
            _to,
            _amount,
            _protectionData,
            ERC20StorageWrapper.getName(),
            ResolverProxyStorageWrapper.getVersion(),
            block.chainid,
            address(this)
        );
        NonceStorageWrapper.setNonceFor(_protectionData.nounce, _from);
        return
            TokenCoreOps.transferByPartition(
                _from,
                BasicTransferInfo(_to, _amount),
                _partition,
                "",
                msg.sender,
                "",
                _getBlockTimestamp(),
                _getBlockNumber()
            );
    }

    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external override {
        AccessStorageWrapper.checkRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition),
            msg.sender
        );
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        ERC1594StorageWrapper.checkCanRedeemFromByPartition(
            msg.sender,
            _from,
            _partition,
            _amount,
            _getBlockTimestamp()
        );
        ERC712.checkNounceAndDeadline(
            _protectionData.nounce,
            _from,
            NonceStorageWrapper.getNonceFor(_from),
            _protectionData.deadline,
            _getBlockTimestamp()
        );
        ProtectedPartitionsStorageWrapper.checkRedeemSignature(
            _partition,
            _from,
            _amount,
            _protectionData,
            ERC20StorageWrapper.getName(),
            ResolverProxyStorageWrapper.getVersion(),
            block.chainid,
            address(this)
        );
        NonceStorageWrapper.setNonceFor(_protectionData.nounce, _from);
        TokenCoreOps.redeemByPartition(
            _partition,
            _from,
            msg.sender,
            _amount,
            "",
            "",
            _getBlockTimestamp(),
            _getBlockNumber()
        );
    }
}
