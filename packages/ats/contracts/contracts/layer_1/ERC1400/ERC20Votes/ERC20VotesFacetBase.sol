// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Votes } from "../../interfaces/ERC1400/IERC20Votes.sol";
import { IERC5805 } from "@openzeppelin/contracts/interfaces/IERC5805.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ERC20Votes } from "./ERC20Votes.sol";

abstract contract ERC20VotesFacetBase is ERC20Votes, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](11);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initialize_ERC20Votes.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.delegate.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.clock.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.CLOCK_MODE.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getVotes.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getPastVotes.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getPastTotalSupply.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.delegates.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.checkpoints.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.numCheckpoints.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.isActivated.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20Votes).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC5805).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC6372).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IVotes).interfaceId;
    }
}
