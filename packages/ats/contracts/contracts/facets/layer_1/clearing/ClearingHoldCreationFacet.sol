// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldCreation } from "./IClearingHoldCreation.sol";
import { ClearingHoldCreation } from "./ClearingHoldCreation.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CLEARING_HOLDCREATION_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract ClearingHoldCreationFacet is ClearingHoldCreation, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_HOLDCREATION_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.clearingCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearingCreateHoldFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.operatorClearingCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedClearingCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingCreateHoldForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IClearingHoldCreation).interfaceId;
    }
}
