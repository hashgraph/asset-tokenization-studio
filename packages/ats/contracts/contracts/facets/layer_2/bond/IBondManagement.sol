// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "./IBondTypes.sol";

/// @title IBondManagement
/// @notice Management functions for Bond domain operations
interface IBondManagement is IBondTypes {
    /**
     * @notice Redeems all bonds at maturity from a token holder (all partitions considered)
     * @param _tokenHolder The address of the token holder redeeming the bonds.
     */
    function fullRedeemAtMaturity(address _tokenHolder) external;

    /**
     * @notice Redeems a specified amount of bonds at maturity from a token holder from a
     * specific partition
     * @param _tokenHolder The address of the token holder redeeming the bonds.
     * @param _partition The partition from which the bonds are being redeemed.
     * @param _amount The amount of bonds to be redeemed.
     */
    function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external;

    /**
     * @notice Updates the maturity date of the bond.
     * @param _maturityDate The new maturity date to be set.
     */
    function updateMaturityDate(uint256 _maturityDate) external returns (bool success_);
}
