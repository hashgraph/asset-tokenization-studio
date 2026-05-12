// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { _KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
import { KpiLinkedRate } from "./KpiLinkedRate.sol";

/**
 * @title KpiLinkedRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the KPI-linked interest rate capability
 *         (`IKpiLinkedRate`) on a token.
 * @dev Implements `IStaticFunctionSelectors` so the BusinessLogicResolver can register
 *      the facet's selectors against the deterministic resolver key declared in
 *      `constants/resolverKeys.sol`.
 */
contract KpiLinkedRateFacet is KpiLinkedRate, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPI_LINKED_RATE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.getKpiLinkedRateImpactData.selector,
                this.getKpiLinkedRateInterestRate.selector,
                this.initializeKpiLinkedRate.selector,
                this.setKpiLinkedRateImpactData.selector,
                this.setKpiLinkedRateInterestRate.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IKpiLinkedRate).interfaceId);
    }
}
