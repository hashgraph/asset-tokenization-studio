// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "./IBondTypes.sol";

/// @title IBondRead
/// @notice Read functions for Bond domain operations
interface IBondRead is IBondTypes {
    /**
     * @notice Retrieves the bond details
     */
    function getBondDetails() external view returns (IBondTypes.BondDetailsData memory bondDetailsData_);

    /**
     * @notice Retrieves principal numerator and denominator for a specific account
     */
    function getPrincipalFor(address _account) external view returns (IBondTypes.PrincipalFor memory principalFor_);
}
