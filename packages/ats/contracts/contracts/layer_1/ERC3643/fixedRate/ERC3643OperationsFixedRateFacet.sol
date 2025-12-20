// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_OPERATIONS_FIXED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { ERC3643OperationsFacetBase } from "../ERC3643OperationsFacetBase.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ERC3643OperationsFixedRateFacet is ERC3643OperationsFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_OPERATIONS_FIXED_RATE_RESOLVER_KEY;
    }
}
