// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Kpis } from "../Kpis.sol";
import { IKpis } from "../../../interfaces/kpis/kpiLatest/IKpis.sol";
import { IStaticFunctionSelectors } from "../../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
// solhint-disable-next-line max-line-length
import {
    _KPIS_LATEST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys/assets.sol";

contract KpisSustainabilityPerformanceTargetRateFacet is Kpis, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPIS_LATEST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this.addKpiData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLatestKpiData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMinDate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isCheckPointDate.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IKpis).interfaceId;
    }
}
