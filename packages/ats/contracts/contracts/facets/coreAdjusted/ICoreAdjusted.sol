// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICoreAdjusted {
    /**
     * @notice Returns the decimals simulating non-triggered decimal adjustments
     *
     * @param _timestamp The timestamp until which ABAFs are simulated
     */
    function decimalsAt(uint256 _timestamp) external view returns (uint8);
}
