// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMint } from "./IMint.sol";
import { Mint } from "./Mint.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _MINT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title MintFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the consolidated token issuance entry points.
 * @dev Registers three selectors: `isIssuable`, `issue` and `mint`. Inherits the business logic
 *      from the `Mint` abstract contract.
 */
contract MintFacet is Mint, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MINT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 3;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.mint.selector;
            staticFunctionSelectors_[--selectorIndex] = this.issue.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isIssuable.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IMint).interfaceId;
    }
}
