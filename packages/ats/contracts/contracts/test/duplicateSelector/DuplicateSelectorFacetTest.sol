// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

/**
 * @title DuplicateSelectorFacetTest
 * @dev Test facet that intentionally duplicates a selector from another facet.
 * Used for testing SelectorAlreadyRegistered error in DiamondCutManager.
 *
 * This facet implements a `transfer` function with the same selector as ERC20Facet.transfer (0xa9059cbb).
 * When both facets are registered in the same configuration, it should trigger the SelectorAlreadyRegistered error.
 *
 * This facet is for testing purposes only and should not be deployed to production.
 */
contract DuplicateSelectorFacetTest is IStaticFunctionSelectors {
    /**
     * @dev Returns the resolver key for this test facet.
     * Uses a unique key for the duplicate selector test.
     */
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = keccak256("DuplicateSelectorFacetTest");
    }

    /**
     * @dev Intentionally uses the same selector as ERC20Facet.transfer (0xa9059cbb).
     * This will conflict when both facets are registered in the same configuration.
     * @param to The recipient address (unused)
     * @param amount The amount to transfer (unused)
     * @return Always returns true
     */
    function transfer(address to, uint256 amount) external pure returns (bool) {
        // Suppress unused parameter warnings
        to;
        amount;
        return true;
    }

    /**
     * @dev Returns the function selectors for this facet.
     * Note: Only includes the transfer selector which conflicts with ERC20Facet.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[0] = this.transfer.selector; // 0xa9059cbb - duplicates ERC20Facet.transfer
    }

    /**
     * @dev Returns the interface IDs for this facet.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](0);
    }
}
