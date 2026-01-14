// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { IERC5805 } from "./IERC5805.sol";
import { CheckpointsLib } from "../../../layer_0/common/libraries/CheckpointsLib.sol";

interface IERC20Votes is IERC5805 {
    error AbafChangeForBlockForbidden(uint256 blockNumber);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(bool _activated) external;

    function isActivated() external view returns (bool);

    function checkpoints(address _account, uint256 _pos) external view returns (CheckpointsLib.Checkpoint memory);

    function numCheckpoints(address _account) external view returns (uint256);
}
