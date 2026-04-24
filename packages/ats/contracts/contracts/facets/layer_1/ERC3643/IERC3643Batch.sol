// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

interface IERC3643Batch is IERC3643Types {
    /**
     * @notice Batch transfer tokens to multiple addresses
     */
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;
}
