// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperator } from "./IOperator.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

abstract contract Operator is IOperator, Modifiers {
    function authorizeOperator(
        address _operator
    ) external override onlyUnpaused onlyCompliant(EvmAccessors.getMsgSender(), _operator, false) {
        ERC1410StorageWrapper.authorizeOperator(_operator);
    }

    function revokeOperator(
        address _operator
    )
        external
        override
        onlyUnpaused
        onlyIdentifiedAddresses(EvmAccessors.getMsgSender(), _operator)
        onlyCompliant(EvmAccessors.getMsgSender(), _operator, false)
    {
        ERC1410StorageWrapper.revokeOperator(_operator);
    }

    function isOperator(address _operator, address _tokenHolder) external view override returns (bool) {
        return ERC1410StorageWrapper.isOperator(_operator, _tokenHolder);
    }
}
