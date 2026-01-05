// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IKpis } from "../../interfaces/kpis/kpiLatest/IKpis.sol";
import { Kpis } from "./Kpis.sol";

abstract contract KpisFacetBase is Kpis, IStaticFunctionSelectors {
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
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IKpis).interfaceId;
    }
}
