// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledBalanceAdjustment } from "./IScheduledBalanceAdjustment.sol";
import { ScheduledBalanceAdjustment } from "./ScheduledBalanceAdjustment.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _SCHEDULED_BALANCE_ADJUSTMENT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ScheduledBalanceAdjustmentFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that consolidates all 6 scheduled balance-adjustment selectors under
 *         a single `_SCHEDULED_BALANCE_ADJUSTMENT_RESOLVER_KEY`.
 * @dev Inherits implementation from `ScheduledBalanceAdjustment` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for selector
 *      registration. Exposes: `setScheduledBalanceAdjustment`, `cancelScheduledBalanceAdjustment`,
 *      `getScheduledBalanceAdjustment`, `getBalanceAdjustmentCount`,
 *      `getPendingBalanceAdjustmentCount`, `getScheduledBalanceAdjustments`.
 */
contract ScheduledBalanceAdjustmentFacet is ScheduledBalanceAdjustment, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_BALANCE_ADJUSTMENT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeScheduledBalanceAdjustment.selector,
                this.setScheduledBalanceAdjustment.selector,
                this.cancelScheduledBalanceAdjustment.selector,
                this.getScheduledBalanceAdjustment.selector,
                this.getBalanceAdjustmentCount.selector,
                this.getPendingBalanceAdjustmentCount.selector,
                this.getScheduledBalanceAdjustments.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IScheduledBalanceAdjustment).interfaceId);
    }
}
