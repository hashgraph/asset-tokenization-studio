// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTracker } from "./IBalanceTracker.sol";
import { BalanceTracker } from "./BalanceTracker.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BALANCE_TRACKER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BalanceTrackerFacet
 * @notice Diamond facet that exposes token balance and total supply queries through the
 *         `IBalanceTracker` interface, registered under `_BALANCE_TRACKER_RESOLVER_KEY`.
 * @dev Inherits balance logic from `BalanceTracker` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes three selectors:
 *      `balanceOf`, `totalSupply`, and `getTotalBalanceFor`.
 * @author Hashgraph
 */
contract BalanceTrackerFacet is BalanceTracker, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key used to register this facet in the Diamond proxy.
     * @return staticResolverKey_ The `_BALANCE_TRACKER_RESOLVER_KEY` constant.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_TRACKER_RESOLVER_KEY;
    }

    /**
     * @notice Returns the function selectors exposed by this facet for Diamond registration.
     * @return staticFunctionSelectors_ Array containing selectors for `balanceOf`,
     *         `totalSupply`, and `getTotalBalanceFor`.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 3;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalBalanceFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.totalSupply.selector;
            staticFunctionSelectors_[--selectorIndex] = this.balanceOf.selector;
        }
    }

    /**
     * @notice Returns the interface IDs supported by this facet for ERC-165 introspection.
     * @return staticInterfaceIds_ Array containing the `IBalanceTracker` interface ID.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IBalanceTracker).interfaceId;
    }
}
