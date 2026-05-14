// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { AdjustBalances } from "./AdjustBalances.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _BALANCE_ADJUSTMENTS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title AdjustBalancesFacet
 * @notice Diamond facet that consolidates all 8 balance-adjustment selectors under a single
 *         `_BALANCE_ADJUSTMENTS_RESOLVER_KEY`.
 * @dev Inherits implementation from `AdjustBalances` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration.
 */
contract AdjustBalancesFacet is AdjustBalances, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_ADJUSTMENTS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.adjustBalances.selector,
                this.setScheduledBalanceAdjustment.selector,
                this.cancelScheduledBalanceAdjustment.selector,
                this.getScheduledBalanceAdjustment.selector,
                this.getBalanceAdjustmentCount.selector,
                this.getPendingBalanceAdjustmentCount.selector,
                this.getScheduledBalanceAdjustments.selector,
                this.triggerAndSyncAll.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IAdjustBalances).interfaceId);
    }
}
