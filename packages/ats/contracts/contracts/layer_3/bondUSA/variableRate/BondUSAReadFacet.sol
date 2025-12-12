// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_VARIABLE_READ_RESOLVER_KEY } from "contracts/layer_2/constants/resolverKeys.sol";
import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";
import { Common } from "contracts/layer_0/common/Common.sol";

contract BondUSAReadFacet is BondUSAReadFacetBase, Common {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_VARIABLE_READ_RESOLVER_KEY;
    }
}
