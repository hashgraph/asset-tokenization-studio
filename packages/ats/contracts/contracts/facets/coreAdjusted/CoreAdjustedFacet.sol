// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAdjusted } from "./ICoreAdjusted.sol";
import { CoreAdjusted } from "./CoreAdjusted.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CORE_ADJUSTED_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

contract CoreAdjustedFacet is CoreAdjusted, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORE_ADJUSTED_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[0] = this.decimalsAt.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ICoreAdjusted).interfaceId;
    }
}
