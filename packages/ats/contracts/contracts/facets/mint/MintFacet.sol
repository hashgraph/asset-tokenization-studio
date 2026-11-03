// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMint, RESOLVER_KEY_MINT } from "./IMint.sol";
import { Mint } from "./Mint.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title MintFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the consolidated token issuance entry points.
 * @dev Registers four selectors: `initializeERC1594`, `isIssuable`, `issue` and `mint`. Inherits the business logic
 *      from the `Mint` abstract contract.
 */
contract MintFacet is Mint, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_MINT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeERC1594.selector,
                this.isIssuable.selector,
                this.issue.selector,
                this.mint.selector,
                this.disableIssuance.selector,
                this.finalizeIssuance.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IMint).interfaceId);
    }
}
