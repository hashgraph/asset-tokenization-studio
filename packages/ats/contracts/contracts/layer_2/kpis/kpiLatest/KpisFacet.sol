// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IKpis } from "../../interfaces/kpis/kpiLatest/IKpis.sol";
import { Kpis } from "./Kpis.sol";
import { _KPI_MANAGER_ROLE } from "../../constants/roles.sol";
import { _KPIS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

abstract contract KpisFacetBase is Kpis, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.addKpiData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLatestKpiData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMinDate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isCheckPointDate.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IKpis).interfaceId;
    }
}

contract KpisFacet is KpisFacetBase, CommonSustainabilityPerformanceTargetInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPIS_RESOLVER_KEY;
    }
}
