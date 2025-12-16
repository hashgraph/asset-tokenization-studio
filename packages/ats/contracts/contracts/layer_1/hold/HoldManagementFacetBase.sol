// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IHoldManagement } from "../interfaces/hold/IHoldManagement.sol";
import { HoldManagement } from "./HoldManagement.sol";

abstract contract HoldManagementFacetBase is IStaticFunctionSelectors, HoldManagement {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.operatorCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.controllerCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedCreateHoldByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IHoldManagement).interfaceId;
    }
}
