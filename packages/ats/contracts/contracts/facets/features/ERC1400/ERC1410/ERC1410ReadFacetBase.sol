// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1410Read } from "../../interfaces/ERC1400/IERC1410Read.sol";
import { LibABAF } from "../../../../lib/domain/LibABAF.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../../lib/domain/LibERC1594.sol";

abstract contract ERC1410ReadFacetBase is IERC1410Read, IStaticFunctionSelectors {
    // ═══════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return LibABAF.balanceOfAdjustedAt(_tokenHolder, _getBlockTimestamp());
    }

    function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256) {
        return LibABAF.balanceOfAdjustedAt(_tokenHolder, _timestamp);
    }

    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256) {
        return LibABAF.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function totalSupply() external view returns (uint256) {
        return LibABAF.totalSupplyAdjustedAt(_getBlockTimestamp());
    }

    function totalSupplyByPartition(bytes32 _partition) external view returns (uint256) {
        return LibABAF.totalSupplyByPartitionAdjustedAt(_partition, _getBlockTimestamp());
    }

    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory) {
        return LibERC1410.partitionsOf(_tokenHolder);
    }

    function isMultiPartition() external view returns (bool) {
        return LibERC1410.isMultiPartition();
    }

    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata,
        bytes calldata
    ) external view returns (bool, bytes1, bytes32) {
        (bool status, bytes1 statusCode, bytes32 reason, ) = LibERC1594.isAbleToTransferFromByPartition(
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
        (bool status, bytes1 code, bytes32 reason, ) = LibERC1594.isAbleToRedeemFromByPartition(
            msg.sender,
            _from,
            _partition,
            _value,
            _getBlockTimestamp()
        );
        return (status, code, reason);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATIC FUNCTION SELECTORS
    // ═══════════════════════════════════════════════════════════════════════════════

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](11);
        uint256 selectorIndex = 0;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAt.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupplyByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.partitionsOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isMultiPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isOperator.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isOperatorForPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.canTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.canRedeemByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Read).interfaceId;
    }

    function isOperator(address _operator, address _tokenHolder) public view returns (bool) {
        return LibERC1410.isOperator(_operator, _tokenHolder);
    }

    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) public view returns (bool) {
        return LibERC1410.isOperatorForPartition(_partition, _operator, _tokenHolder);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
