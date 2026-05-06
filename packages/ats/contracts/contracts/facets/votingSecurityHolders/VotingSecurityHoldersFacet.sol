// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IVotingSecurityHolders } from "./IVotingSecurityHolders.sol";
import { VotingSecurityHolders } from "./VotingSecurityHolders.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _VOTING_SECURITY_HOLDERS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title VotingSecurityHoldersFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes voting security-holder queries via
 *         `IVotingSecurityHolders`, registered under `_VOTING_SECURITY_HOLDERS_RESOLVER_KEY`.
 * @dev Consolidates holder-enumeration methods previously part of `VotingFacet`:
 *      `getVotingHolders`, `getTotalVotingHolders`.
 *      Must be registered alongside `VotingFacet` in all token configurations that include
 *      voting functionality.
 *      Exposes 2 selectors and declares `IVotingSecurityHolders` as its interface ID.
 */
contract VotingSecurityHoldersFacet is VotingSecurityHolders, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _VOTING_SECURITY_HOLDERS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalVotingHolders.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getVotingHolders.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IVotingSecurityHolders).interfaceId;
        }
    }
}
