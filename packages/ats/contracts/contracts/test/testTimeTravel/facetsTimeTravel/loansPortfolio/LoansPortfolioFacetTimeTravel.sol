// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LoansPortfolioFacet } from "../../../../facets/layer_2/loansPortfolio/LoansPortfolioFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract LoansPortfolioFacetTimeTravel is LoansPortfolioFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
