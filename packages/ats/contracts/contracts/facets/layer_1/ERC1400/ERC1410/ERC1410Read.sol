// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Read } from "./IERC1410Read.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";

abstract contract ERC1410Read is IERC1410Read, Modifiers {
    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory) {
        return ERC1410StorageWrapper.partitionsOf(_tokenHolder);
    }

    function isMultiPartition() external view returns (bool) {
        return ERC1410StorageWrapper.isMultiPartition();
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
