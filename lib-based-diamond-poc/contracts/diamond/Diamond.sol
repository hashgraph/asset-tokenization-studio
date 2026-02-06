// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./DiamondStorage.sol";

/**
 * @title Diamond
 * @notice Minimal EIP-2535 Diamond proxy - shared by both architectures
 */
contract Diamond {
    error FunctionNotFound(bytes4 selector);

    constructor(address _diamondCutFacet) {
        // Add diamondCut function
        DiamondStorage storage ds = diamondStorage();
        bytes4 selector = IDiamondCut.diamondCut.selector;
        ds.selectorToFacet[selector] = _diamondCutFacet;
        ds.selectors.push(selector);
        ds.selectorToIndex[selector] = 0;
    }

    fallback() external payable {
        DiamondStorage storage ds = diamondStorage();
        address facet = ds.selectorToFacet[msg.sig];
        if (facet == address(0)) revert FunctionNotFound(msg.sig);

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    receive() external payable {}
}

// =============================================================================
// DIAMOND CUT INTERFACE & FACET
// =============================================================================

interface IDiamondCut {
    enum FacetCutAction { Add, Replace, Remove }

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    function diamondCut(FacetCut[] calldata cuts) external;
}

contract DiamondCutFacet is IDiamondCut {
    function diamondCut(FacetCut[] calldata cuts) external override {
        DiamondStorage storage ds = diamondStorage();

        for (uint256 i = 0; i < cuts.length; i++) {
            FacetCut memory cut = cuts[i];

            if (cut.action == FacetCutAction.Add) {
                for (uint256 j = 0; j < cut.functionSelectors.length; j++) {
                    bytes4 selector = cut.functionSelectors[j];
                    ds.selectorToFacet[selector] = cut.facetAddress;
                    ds.selectorToIndex[selector] = ds.selectors.length;
                    ds.selectors.push(selector);
                }
            } else if (cut.action == FacetCutAction.Replace) {
                for (uint256 j = 0; j < cut.functionSelectors.length; j++) {
                    bytes4 selector = cut.functionSelectors[j];
                    ds.selectorToFacet[selector] = cut.facetAddress;
                }
            } else if (cut.action == FacetCutAction.Remove) {
                for (uint256 j = 0; j < cut.functionSelectors.length; j++) {
                    bytes4 selector = cut.functionSelectors[j];
                    ds.selectorToFacet[selector] = address(0);
                }
            }
        }
    }
}
