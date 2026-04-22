// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "./IERC20Votes.sol";
import { IERC5805 } from "@openzeppelin/contracts/interfaces/IERC5805.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import { ERC20Votes } from "./ERC20Votes.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC20VOTES_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

/**
 * @title ERC20 Votes Facet
 * @notice Diamond facet exposing ERC-5805 voting power functionality via the proxy router.
 * @dev Registers eleven function selectors (initialisation, delegation, clock, query functions)
 *      and four interface IDs (IERC20Votes, IERC5805, IERC6372, IVotes). Inherits all logic
 *      from `ERC20Votes`.
 * @author io.builders
 */
contract ERC20VotesFacet is ERC20Votes, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key identifying this facet in the proxy registry.
     * @return staticResolverKey_ The bytes32 key for the ERC20Votes facet.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20VOTES_RESOLVER_KEY;
    }

    /**
     * @notice Returns the list of function selectors exposed by this facet.
     * @dev Registers eleven selectors: `initialize_ERC20Votes`, `delegate`, `clock`,
     *      `CLOCK_MODE`, `getVotes`, `getPastVotes`, `getPastTotalSupply`, `delegates`,
     *      `checkpoints`, `numCheckpoints`, and `isActivated`.
     * @return staticFunctionSelectors_ Array of four-byte function selectors.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](11);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ERC20Votes.selector;
        staticFunctionSelectors_[selectorIndex++] = this.delegate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clock.selector;
        staticFunctionSelectors_[selectorIndex++] = this.CLOCK_MODE.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotes.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPastVotes.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPastTotalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.delegates.selector;
        staticFunctionSelectors_[selectorIndex++] = this.checkpoints.selector;
        staticFunctionSelectors_[selectorIndex++] = this.numCheckpoints.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isActivated.selector;
    }

    /**
     * @notice Returns the ERC-165 interface IDs supported by this facet.
     * @dev Declares support for `IERC20Votes`, `IERC5805`, `IERC6372`, and `IVotes`.
     * @return staticInterfaceIds_ Array of four-byte ERC-165 interface identifiers.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20Votes).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC5805).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC6372).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IVotes).interfaceId;
    }
}
