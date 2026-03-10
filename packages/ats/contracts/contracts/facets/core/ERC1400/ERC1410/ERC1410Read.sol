// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { IERC1410Read } from "../../ERC1400/ERC1410/IERC1410Read.sol";
import { ABAFStorageWrapper } from "../../../../domain/asset/ABAFStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC1410Read is IERC1410Read, TimestampProvider {
    // ═══════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return ABAFStorageWrapper.balanceOfAdjustedAt(_tokenHolder, _getBlockTimestamp());
    }

    function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256) {
        return ABAFStorageWrapper.balanceOfAdjustedAt(_tokenHolder, _timestamp);
    }

    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256) {
        return ABAFStorageWrapper.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function totalSupply() external view returns (uint256) {
        return ABAFStorageWrapper.totalSupplyAdjustedAt(_getBlockTimestamp());
    }

    function totalSupplyByPartition(bytes32 _partition) external view returns (uint256) {
        return ABAFStorageWrapper.totalSupplyByPartitionAdjustedAt(_partition, _getBlockTimestamp());
    }

    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory) {
        return ERC1410StorageWrapper.partitionsOf(_tokenHolder);
    }

    function isMultiPartition() external view returns (bool) {
        return ERC1410StorageWrapper.isMultiPartition();
    }

    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata,
        bytes calldata
    ) external view returns (bool, bytes1, bytes32) {
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
            msg.sender,
            _from,
            _to,
            _partition,
            _value,
            _getBlockTimestamp()
        );
        return (status, statusCode, reason);
    }

    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata,
        bytes calldata
    ) external view override returns (bool, bytes1, bytes32) {
        (bool status, bytes1 code, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToRedeemFromByPartition(
            msg.sender,
            _from,
            _partition,
            _value,
            _getBlockTimestamp()
        );
        return (status, code, reason);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PUBLIC VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function isOperator(address _operator, address _tokenHolder) public view returns (bool) {
        return ERC1410StorageWrapper.isOperator(_operator, _tokenHolder);
    }

    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) public view returns (bool) {
        return ERC1410StorageWrapper.isOperatorForPartition(_partition, _operator, _tokenHolder);
    }
}
