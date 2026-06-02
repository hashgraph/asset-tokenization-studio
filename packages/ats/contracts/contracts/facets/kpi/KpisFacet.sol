// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis, RESOLVER_KEY_KPIS } from "./IKpis.sol";
import { Kpis } from "./Kpis.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title  KpisFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes KPI data management to the proxy.
 * @dev    Selectors exposed:
 *         - `initializeKpis`
 *         - `addKpiData`
 *         - `getLatestKpiData`
 *         - `getMinDate`
 *         - `isCheckPointDate`
 */
contract KpisFacet is Kpis, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_KPIS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeKpis.selector,
                this.addKpiData.selector,
                this.getLatestKpiData.selector,
                this.getMinDate.selector,
                this.isCheckPointDate.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IKpis).interfaceId);
    }
}
