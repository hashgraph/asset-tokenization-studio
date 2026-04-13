// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NominalValue } from "./NominalValue.sol";
import { INominalValue } from "./INominalValue.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _NOMINAL_VALUE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract NominalValueFacet is NominalValue, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _NOMINAL_VALUE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](4);
        uint256 selectorIndex;
        staticFunctionSelectors_[selectorIndex++] = this.getNominalValue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNominalValueDecimals.selector;
        staticFunctionSelectors_[selectorIndex++] = this.initialize_NominalValue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setNominalValue.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(INominalValue).interfaceId;
    }
}
