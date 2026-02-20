// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Cap } from "./Cap.sol";
import { ICap } from "../interfaces/ICap.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _CAP_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract CapFacet is Cap, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CAP_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](5);
        uint256 selectorIndex;
        staticFunctionSelectors_[selectorIndex++] = this.initialize_Cap.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setMaxSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setMaxSupplyByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMaxSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMaxSupplyByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICap).interfaceId;
    }
}
