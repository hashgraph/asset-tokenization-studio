// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

interface IERC3643Read is IERC3643Types {
    /**
     * @notice Retrieves recovery status of a wallet
     */
    function isAddressRecovered(address _wallet) external view returns (bool);
}
