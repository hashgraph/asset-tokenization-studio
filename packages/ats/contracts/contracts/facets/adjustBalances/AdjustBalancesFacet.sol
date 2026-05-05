// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { AdjustBalances } from "./AdjustBalances.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 8;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.triggerAndSyncAll.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getScheduledBalanceAdjustments.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getPendingBalanceAdjustmentCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getBalanceAdjustmentCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getScheduledBalanceAdjustment.selector;
            staticFunctionSelectors_[--selectorIndex] = this.cancelScheduledBalanceAdjustment.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setScheduledBalanceAdjustment.selector;
            staticFunctionSelectors_[--selectorIndex] = this.adjustBalances.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IAdjustBalances).interfaceId;
        }
    }
}
