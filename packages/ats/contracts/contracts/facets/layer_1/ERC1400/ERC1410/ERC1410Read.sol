// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Read } from "./IERC1410Read.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../../domain/asset/ERC1594StorageWrapper.sol";
import { PauseModifiers } from "../../../../domain/core/PauseModifiers.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { IPauseStorageWrapper } from "../../../../domain/core/pause/IPauseStorageWrapper.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { Eip1066 } from "../../../../constants/eip1066.sol";

abstract contract ERC1410Read is IERC1410Read, TimestampProvider, PauseModifiers {
    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfAdjustedAt(_tokenHolder, _getBlockTimestamp());
    }

    function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfAdjustedAt(_tokenHolder, _timestamp);
    }

    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function totalSupply() external view returns (uint256) {
        return ERC1410StorageWrapper.totalSupplyAdjustedAt(_getBlockTimestamp());
    }

    function totalSupplyByPartition(bytes32 _partition) external view returns (uint256) {
        return ERC1410StorageWrapper.totalSupplyByPartitionAdjustedAt(_partition, _getBlockTimestamp());
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
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPauseStorageWrapper.TokenIsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
            _from,
            _to,
            _partition,
            _value,
            _data,
            _operatorData
        );
        return (status, statusCode, reason);
    }

    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view override returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPauseStorageWrapper.TokenIsPaused.selector);
        }
        (bool status, bytes1 code, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToRedeemFromByPartition(
            _from,
            _partition,
            _value,
            _data,
            _operatorData
        );
        return (status, code, reason);
    }

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
