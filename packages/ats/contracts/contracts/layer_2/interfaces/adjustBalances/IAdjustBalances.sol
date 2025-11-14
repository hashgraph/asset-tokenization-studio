// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IAdjustBalances {
    /**
     * @notice Adjusts the balances of all users by a given factor and decimals
     * @dev This action is triggered inmediately, contrary to the secheduled methods that add tasks to the queue
     */
    function adjustBalances(uint256 factor, uint8 decimals) external returns (bool success_);
}
