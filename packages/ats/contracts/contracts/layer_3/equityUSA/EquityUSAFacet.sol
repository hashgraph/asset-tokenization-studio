// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquityUSA } from "../interfaces/IEquityUSA.sol";
import { _EQUITY_RESOLVER_KEY } from "../../layer_2/constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IEquity } from "../../layer_2/interfaces/equity/IEquity.sol";
import { ISecurity } from "../interfaces/ISecurity.sol";
import { EquityUSA } from "./EquityUSA.sol";

contract EquityUSAFacet is EquityUSA, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EQUITY_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](20);
        staticFunctionSelectors_[selectorIndex++] = this._initialize_equityUSA.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getEquityDetails.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setDividends.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividends.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividendsFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividendsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setScheduledBalanceAdjustment.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledBalanceAdjustment.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledBalanceAdjustmentCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityRegulationData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalSecurityHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividendHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalDividendHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalVotingHolders.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IEquity).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(ISecurity).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IEquityUSA).interfaceId;
    }
}
