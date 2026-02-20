// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EquityUSA } from "./EquityUSA.sol";
import { IEquityUSA } from "../interfaces/IEquityUSA.sol";
import { IEquity } from "../../assetCapabilities/interfaces/equity/IEquity.sol";
import { ISecurity } from "../interfaces/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _EQUITY_RESOLVER_KEY } from "../../../constants/resolverKeys/assets.sol";

contract EquityUSAFacet is EquityUSA, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32) {
        return _EQUITY_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        uint256 selectorIndex;
        bytes4[] memory selectors = new bytes4[](21);
        // solhint-disable-next-line func-name-mixedcase
        selectors[selectorIndex++] = this._initialize_equityUSA.selector;
        selectors[selectorIndex++] = this.getEquityDetails.selector;
        selectors[selectorIndex++] = this.setDividends.selector;
        selectors[selectorIndex++] = this.getDividends.selector;
        selectors[selectorIndex++] = this.getDividendsFor.selector;
        selectors[selectorIndex++] = this.getDividendAmountFor.selector;
        selectors[selectorIndex++] = this.getDividendsCount.selector;
        selectors[selectorIndex++] = this.setVoting.selector;
        selectors[selectorIndex++] = this.getVoting.selector;
        selectors[selectorIndex++] = this.getVotingFor.selector;
        selectors[selectorIndex++] = this.getVotingCount.selector;
        selectors[selectorIndex++] = this.setScheduledBalanceAdjustment.selector;
        selectors[selectorIndex++] = this.getScheduledBalanceAdjustment.selector;
        selectors[selectorIndex++] = this.getScheduledBalanceAdjustmentCount.selector;
        selectors[selectorIndex++] = this.getSecurityRegulationData.selector;
        selectors[selectorIndex++] = this.getSecurityHolders.selector;
        selectors[selectorIndex++] = this.getTotalSecurityHolders.selector;
        selectors[selectorIndex++] = this.getDividendHolders.selector;
        selectors[selectorIndex++] = this.getTotalDividendHolders.selector;
        selectors[selectorIndex++] = this.getVotingHolders.selector;
        selectors[selectorIndex++] = this.getTotalVotingHolders.selector;
        return selectors;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        bytes4[] memory interfaceIds = new bytes4[](3);
        interfaceIds[0] = type(IEquity).interfaceId;
        interfaceIds[1] = type(ISecurity).interfaceId;
        interfaceIds[2] = type(IEquityUSA).interfaceId;
        return interfaceIds;
    }
}
