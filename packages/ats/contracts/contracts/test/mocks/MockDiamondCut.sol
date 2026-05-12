// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// TEST-ONLY: mock variant of `DiamondFacet` used by the InitializeMock domain.
// Inherits the same `DiamondCut` + `DiamondLoupe` bases that production
// `DiamondFacet` does — exposes the identical 18-selector surface
// (`updateConfigVersion`, `updateConfig`, `updateResolver`, `getConfigInfo`,
// plus all loupe selectors) — and additionally provides a mock-style
// `initializeDiamondCut()` that mirrors `initializeMockFacet1/2/3`: it carries
// the `onlyFacetNotRegistered` modifier and simply marks itself ready by
// calling `setFacetToReady`. A dedicated resolver key keeps it distinct from
// production `DiamondFacet` so both can live side-by-side in the BLR.

import { DiamondCut } from "../../infrastructure/diamond/DiamondCut.sol";
import { DiamondLoupe } from "../../infrastructure/diamond/DiamondLoupe.sol";
import { IDiamond } from "../../infrastructure/proxy/IDiamond.sol";
import { IDiamondCut } from "../../infrastructure/proxy/IDiamondCut.sol";
import { IDiamondLoupe } from "../../infrastructure/proxy/IDiamondLoupe.sol";
import { InitializerModifiers } from "../../services/core/InitializerModifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// TEST-ONLY: resolver key for MockDiamondCut. Mirrors the
// `bytes32("MockDiamondCut")` Solidity literal (14 ASCII bytes right-padded
// with 18 zero bytes), matching the same scheme used for MockFacet1/2/3.
bytes32 constant _MOCK_DIAMOND_CUT_RESOLVER_KEY = bytes32("MockDiamondCut");

interface IMockDiamondCut {
    function initializeDiamondCut() external;
}

// `IStaticFunctionSelectors` is intentionally not listed: it is already pulled
// in transitively by `IDiamondCut` and `IDiamondLoupe`, and re-declaring it
// here would break C3 linearization. Mirrors `DiamondFacet`'s parent layout
// with two test-only additions: `InitializerModifiers` (for
// `onlyFacetNotRegistered`) and `IMockDiamondCut` (for the new initializer).
contract MockDiamondCut is IDiamond, DiamondCut, DiamondLoupe, InitializerModifiers, IMockDiamondCut {
    function initializeDiamondCut() external override onlyFacetNotRegistered(_MOCK_DIAMOND_CUT_RESOLVER_KEY) {
        InitializerStorageWrapper.setFacetToReady(_MOCK_DIAMOND_CUT_RESOLVER_KEY);
    }

    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MOCK_DIAMOND_CUT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](19);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initializeDiamondCut.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateConfigVersion.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateConfig.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateResolver.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getConfigInfo.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacets.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetsLength.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectors.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectorsLength.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectorsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIds.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIdsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddresses.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddressesByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIdBySelector.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacet.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddress.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.supportsInterface.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](5);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondCut).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondLoupe).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC165).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IMockDiamondCut).interfaceId;
    }
}
