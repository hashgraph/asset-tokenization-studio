// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { IERC5805 } from "./IERC5805.sol";
import { LibCheckpoints } from "../../../../infrastructure/lib/LibCheckpoints.sol";

interface IERC20Votes is IERC5805 {
    error AbafChangeForBlockForbidden(uint256 blockNumber);
    error ERC20VotesFutureLookup(uint256 timepoint, uint256 currentBlock);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external;

    function isActivated() external view returns (bool);

    function checkpoints(address _account, uint256 _pos) external view returns (LibCheckpoints.Checkpoint memory);

    function numCheckpoints(address _account) external view returns (uint256);
}
