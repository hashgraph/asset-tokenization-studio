// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management } from "../../interfaces/ERC1400/IERC1410Management.sol";
import { IControlListBase } from "../../interfaces/controlList/IControlListBase.sol";
import { IERC1644Base } from "../../interfaces/ERC1400/IERC1644Base.sol";
import { IProtectedPartitions } from "../../interfaces/IProtectedPartitions.sol";
import { BasicTransferInfo, OperatorTransferData } from "../../interfaces/ERC1400/IERC1410.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../../lib/domain/LibERC1594.sol";
import { LibERC1644 } from "../../../../lib/domain/LibERC1644.sol";
import { LibProtectedPartitions } from "../../../../lib/core/LibProtectedPartitions.sol";
import { LibNonce } from "../../../../lib/core/LibNonce.sol";
import { LibResolverProxy } from "../../../../infrastructure/proxy/LibResolverProxy.sol";
import { LibERC20 } from "../../../../lib/domain/LibERC20.sol";
import { LibTokenTransfer } from "../../../../lib/orchestrator/LibTokenTransfer.sol";
import { TimestampProvider } from "../../../../infrastructure/lib/TimestampProvider.sol";
import { LibERC712 } from "../../../../lib/core/LibERC712.sol";
import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1410Management is IERC1410Management, IControlListBase, IERC1644Base, TimestampProvider {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external override {
        if (LibERC1410.isInitialized()) revert AlreadyInitialized();
        LibERC1410.initialize(_multiPartition);
    }

    function controllerTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override returns (bytes32) {
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibERC1644.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        return
            LibTokenTransfer.transferByPartition(
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
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibERC1644.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        LibTokenTransfer.redeemByPartition(
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
        LibERC1410.checkDefaultPartitionWithSinglePartition(_operatorTransferData.partition);
        LibERC1410.checkOperator(_operatorTransferData.partition, msg.sender, _operatorTransferData.from);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1410.requireValidAddress(_operatorTransferData.to);
        LibERC1594.checkCanTransferFromByPartition(
            msg.sender,
            _operatorTransferData.from,
            _operatorTransferData.to,
            _operatorTransferData.partition,
            _operatorTransferData.value,
            _getBlockTimestamp()
        );
        return
            LibTokenTransfer.transferByPartition(
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
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibERC1410.checkOperator(_partition, msg.sender, _tokenHolder);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanRedeemFromByPartition(msg.sender, _tokenHolder, _partition, _value, _getBlockTimestamp());
        LibTokenTransfer.redeemByPartition(
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
        LibAccess.checkRole(LibProtectedPartitions.protectedPartitionsRole(_partition), msg.sender);
        LibProtectedPartitions.requireProtectedPartitions();
        LibERC1594.checkCanTransferFromByPartition(msg.sender, _from, _to, _partition, _amount, _getBlockTimestamp());
        LibERC712.checkNounceAndDeadline(
            _protectionData.nounce,
            _from,
            LibNonce.getNonceFor(_from),
            _protectionData.deadline,
            _getBlockTimestamp()
        );
        LibProtectedPartitions.checkTransferSignature(
            _partition,
            _from,
            _to,
            _amount,
            _protectionData,
            LibERC20.getName(),
            LibResolverProxy.getVersion(),
            block.chainid,
            address(this)
        );
        LibNonce.setNonceFor(_protectionData.nounce, _from);
        return
            LibTokenTransfer.transferByPartition(
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
        LibAccess.checkRole(LibProtectedPartitions.protectedPartitionsRole(_partition), msg.sender);
        LibProtectedPartitions.requireProtectedPartitions();
        LibERC1594.checkCanRedeemFromByPartition(msg.sender, _from, _partition, _amount, _getBlockTimestamp());
        LibERC712.checkNounceAndDeadline(
            _protectionData.nounce,
            _from,
            LibNonce.getNonceFor(_from),
            _protectionData.deadline,
            _getBlockTimestamp()
        );
        LibProtectedPartitions.checkRedeemSignature(
            _partition,
            _from,
            _amount,
            _protectionData,
            LibERC20.getName(),
            LibResolverProxy.getVersion(),
            block.chainid,
            address(this)
        );
        LibNonce.setNonceFor(_protectionData.nounce, _from);
        LibTokenTransfer.redeemByPartition(
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
