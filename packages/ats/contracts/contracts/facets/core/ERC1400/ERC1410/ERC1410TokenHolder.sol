// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410TokenHolder } from "../../ERC1400/ERC1410/IERC1410TokenHolder.sol";
import { IControlListBase } from "../../controlList/IControlListBase.sol";
import { BasicTransferInfo } from "../../ERC1400/ERC1410/IERC1410Types.sol";
import { LibPause } from "../../../../domain/core/LibPause.sol";
import { LibERC1410 } from "../../../../domain/assets/LibERC1410.sol";
import { LibERC1594 } from "../../../../domain/assets/LibERC1594.sol";
import { LibProtectedPartitions } from "../../../../domain/core/LibProtectedPartitions.sol";
import { LibABAF } from "../../../../domain/assets/LibABAF.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC1410TokenHolder is IERC1410TokenHolder, IControlListBase, TimestampProvider {
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    ) external override returns (bytes32) {
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibERC1594.checkCanTransferFromByPartition(
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
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibERC1594.checkCanRedeemFromByPartition(msg.sender, msg.sender, _partition, _value, _getBlockTimestamp());
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
        LibPause.requireNotPaused();
        LibABAF.triggerAndSyncAll(_partition, _from, _to);
    }

    function authorizeOperator(address _operator) external override {
        LibPause.requireNotPaused();
        LibERC1594.checkCompliance(msg.sender, msg.sender, _operator, false);
        LibERC1410.authorizeOperator(_operator, msg.sender);
    }

    function revokeOperator(address _operator) external override {
        LibPause.requireNotPaused();
        LibERC1594.checkCompliance(msg.sender, msg.sender, address(0), false);
        LibERC1410.revokeOperator(_operator, msg.sender);
    }

    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external override {
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibERC1594.checkCompliance(msg.sender, msg.sender, _operator, false);
        LibERC1410.authorizeOperatorByPartition(_partition, _operator, msg.sender);
    }

    function revokeOperatorByPartition(bytes32 _partition, address _operator) external override {
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        LibERC1594.checkCompliance(msg.sender, msg.sender, address(0), false);
        LibERC1410.revokeOperatorByPartition(_partition, _operator, msg.sender);
    }
}
