// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DividendFacetBase } from "../DividendFacetBase.sol";
import { _DIVIDEND_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract DividendFacet is DividendFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32) {
        return _DIVIDEND_RESOLVER_KEY;
    }
}
