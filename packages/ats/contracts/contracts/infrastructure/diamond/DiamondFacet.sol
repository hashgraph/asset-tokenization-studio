// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { DiamondBase } from "./DiamondBase.sol";
import { IDiamond, RESOLVER_KEY_DIAMOND } from "../proxy/IDiamond.sol";
import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { IDiamondLoupe } from "../proxy/IDiamondLoupe.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IStaticFunctionSelectors } from "../proxy/IStaticFunctionSelectors.sol";

// Remember to add the loupe functions from DiamondLoupeFacet to the diamond.
// The loupe functions are required by the EIP2535 Diamonds standard
/**
 * @title DiamondFacet
 * @notice Exposes Diamond management, loupe, and ERC-165 selectors for proxy registration.
 * @dev Provides static resolver metadata for the core Diamond facet under
 *      `RESOLVER_KEY_DIAMOND`. The returned selectors include Diamond cut, resolver
 *      configuration, Diamond loupe pagination, facet lookup, and interface support
 *      functions inherited through `DiamondBase`.
 * @author Asset Tokenization Studio Team
 */
contract DiamondFacet is IDiamond, DiamondBase {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_DIAMOND;
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev The selector count must remain aligned with the number of assigned selectors.
    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorsIndex = 20;
        staticFunctionSelectors_ = new bytes4[](selectorsIndex);
        unchecked {
            staticFunctionSelectors_[--selectorsIndex] = this.initializeDiamondCut.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.updateConfigVersion.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.updateConfig.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.updateReplacementEnabled.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.updateResolver.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getConfigInfo.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacets.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetsLength.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetsByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetSelectors.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetSelectorsLength.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetSelectorsByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetIds.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetIdsByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetAddresses.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetAddressesByPage.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetIdBySelector.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacet.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.getFacetAddress.selector;
            staticFunctionSelectors_[--selectorsIndex] = this.supportsInterface.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Registers the Diamond, Diamond cut, Diamond loupe, and ERC-165 interface IDs.
    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorsIndex = 4;
        staticInterfaceIds_ = new bytes4[](selectorsIndex);
        unchecked {
            staticInterfaceIds_[--selectorsIndex] = type(IDiamond).interfaceId;
            staticInterfaceIds_[--selectorsIndex] = type(IDiamondCut).interfaceId;
            staticInterfaceIds_[--selectorsIndex] = type(IDiamondLoupe).interfaceId;
            staticInterfaceIds_[--selectorsIndex] = type(IERC165).interfaceId;
        }
    }
}
