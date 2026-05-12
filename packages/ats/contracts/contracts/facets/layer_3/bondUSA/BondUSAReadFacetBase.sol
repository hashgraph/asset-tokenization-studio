// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondRead } from "../../layer_2/bond/BondRead.sol";
import { Security } from "../../layer_2/security/Security.sol";
import { IBondRead } from "../../layer_2/bond/IBondRead.sol";
import { ISecurity } from "../../layer_2/security/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title BondUSAReadFacetBase
 * @author Asset Tokenization Studio Team
 * @notice Shared read-side scaffold inherited by every concrete USA-bond read facet
 *         (`BondUSAReadFacet` plus the three rate variants — fixed rate, KPI-linked rate, and
 *         sustainability-performance-target rate). Carries the 4-selector array and the
 *         EIP-165 interfaceId list common to all variants; concrete facets only have to supply
 *         the resolver key that distinguishes them on the diamond.
 * @dev Three-tier scaffold (`BondRead`/`Security` → `BondUSAReadFacetBase` → concrete facet)
 *      because the same selector set and interfaceId pair are reused by 4 concrete read
 *      facets. The exposed surface is the union of `IBondRead` (`getBondDetails`) and
 *      `ISecurity` (`getSecurityRegulationData`, `getSecurityHolders`,
 *      `getTotalSecurityHolders`); both interfaceIds are advertised so callers can probe
 *      either contract independently via EIP-165.
 */
abstract contract BondUSAReadFacetBase is BondRead, IStaticFunctionSelectors, Security {
    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Selectors are written in reverse via `--selectorIndex` inside an `unchecked`
    ///      block; the resulting array reads in declaration order (`getBondDetails`,
    ///      `getSecurityRegulationData`, `getSecurityHolders`, `getTotalSecurityHolders`).
    ///      All four concrete USA-bond read facets share this selector set.
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getSecurityRegulationData.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getBondDetails.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Advertises both `IBondRead` (bond-specific reads) and `ISecurity` (USA
    ///      Reg-S/Reg-D holder bookkeeping) so EIP-165 probes for either interface succeed
    ///      against the diamond.
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](2);
        staticInterfaceIds_[0] = type(IBondRead).interfaceId;
        staticInterfaceIds_[1] = type(ISecurity).interfaceId;
    }
}
