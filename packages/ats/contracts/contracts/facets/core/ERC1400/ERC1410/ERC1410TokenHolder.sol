// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410TokenHolder } from "../../ERC1400/ERC1410/IERC1410TokenHolder.sol";
import { IControlListBase } from "../../controlList/IControlListBase.sol";
import { BasicTransferInfo } from "../../ERC1400/ERC1410/IERC1410Types.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../../domain/asset/ABAFStorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC1410TokenHolder is IERC1410TokenHolder, IControlListBase, TimestampProvider {
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    ) external override returns (bytes32) {
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ERC1594StorageWrapper.checkCanTransferFromByPartition(
            msg.sender,
            msg.sender,
            _basicTransferInfo.to,
            _partition,
            _basicTransferInfo.value,
            _getBlockTimestamp()
        );
        return
            TokenCoreOps.transferByPartition(
                msg.sender,
                _basicTransferInfo,
                _partition,
                _data,
                address(0),
                "",
                _getBlockTimestamp(),
                _getBlockNumber()
            );
    }

    function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external override {
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ERC1594StorageWrapper.checkCanRedeemFromByPartition(
            msg.sender,
            msg.sender,
            _partition,
            _value,
            _getBlockTimestamp()
        );
        TokenCoreOps.redeemByPartition(
            _partition,
            msg.sender,
            address(0),
            _value,
            _data,
            "",
            _getBlockTimestamp(),
            _getBlockNumber()
        );
    }

    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external {
        PauseStorageWrapper.requireNotPaused();
        ABAFStorageWrapper.triggerAndSyncAll(_partition, _from, _to);
    }

    function authorizeOperator(address _operator) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, _operator, false);
        ERC1410StorageWrapper.authorizeOperator(_operator, msg.sender);
    }

    function revokeOperator(address _operator) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, address(0), false);
        ERC1410StorageWrapper.revokeOperator(_operator, msg.sender);
    }

    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, _operator, false);
        ERC1410StorageWrapper.authorizeOperatorByPartition(_partition, _operator, msg.sender);
    }

    function revokeOperatorByPartition(bytes32 _partition, address _operator) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        ERC1594StorageWrapper.checkCompliance(msg.sender, msg.sender, address(0), false);
        ERC1410StorageWrapper.revokeOperatorByPartition(_partition, _operator, msg.sender);
    }
}
