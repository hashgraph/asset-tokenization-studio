// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IVotingSecurityHolders, RESOLVER_KEY_VOTING_SECURITY_HOLDERS } from "./IVotingSecurityHolders.sol";
import { VotingSecurityHolders } from "./VotingSecurityHolders.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title VotingSecurityHoldersFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes voting security-holder queries via
 *         `IVotingSecurityHolders`, registered under `RESOLVER_KEY_VOTING_SECURITY_HOLDERS`.
 * @dev Consolidates holder-enumeration methods previously part of `VotingFacet`:
 *      `getVotingHolders`, `getTotalVotingHolders`.
 *      Must be registered alongside `VotingFacet` in all token configurations that include
 *      voting functionality.
 *      Exposes 2 selectors and declares `IVotingSecurityHolders` as its interface ID.
 */
contract VotingSecurityHoldersFacet is VotingSecurityHolders, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_VOTING_SECURITY_HOLDERS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.getVotingHolders.selector, this.getTotalVotingHolders.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IVotingSecurityHolders).interfaceId);
    }
}
