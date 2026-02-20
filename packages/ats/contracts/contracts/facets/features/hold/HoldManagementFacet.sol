// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldManagement } from "./HoldManagement.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IHoldManagement } from "../interfaces/hold/IHoldManagement.sol";
import { _HOLD_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract HoldManagementFacet is HoldManagement, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.operatorCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.controllerCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedCreateHoldByPartition.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IHoldManagement).interfaceId;
    }
}
