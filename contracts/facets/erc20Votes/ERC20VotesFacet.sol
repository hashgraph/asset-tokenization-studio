// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes, RESOLVER_KEY_ERC20VOTES } from "./IERC20Votes.sol";
import { IERC5805 } from "@openzeppelin/contracts/interfaces/IERC5805.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import { ERC20Votes } from "./ERC20Votes.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ERC20VotesFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes ERC-20 voting-delegation and checkpoint query selectors.
 * @dev Registers the full ERC-5805/ERC-6372/IVotes interface surface via `getStaticFunctionSelectors`.
 *      Inherits all business logic from `ERC20Votes`.
 */
contract ERC20VotesFacet is ERC20Votes, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_ERC20VOTES;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeERC20Votes.selector,
                this.delegate.selector,
                this.clock.selector,
                this.CLOCK_MODE.selector,
                this.getVotes.selector,
                this.getPastVotes.selector,
                this.getPastTotalSupply.selector,
                this.delegates.selector,
                this.checkpoints.selector,
                this.numCheckpoints.selector,
                this.isActivated.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                type(IERC20Votes).interfaceId,
                type(IERC5805).interfaceId,
                type(IERC6372).interfaceId,
                type(IVotes).interfaceId
            );
    }
}
