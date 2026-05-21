// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IFixedRate } from "./IFixedRate.sol";
import { _FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
import { FixedRate } from "./FixedRate.sol";

contract FixedRateFacet is FixedRate, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FIXED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeFixedRate.selector, this.setRate.selector, this.getRate.selector);
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFixedRate).interfaceId);
    }
}
