// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IExternalPause {
    /**
     * @notice Checks if the contract is paused in the external pause contract
     */
    function isPaused() external view returns (bool);
}
