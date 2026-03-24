// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface TRexIBondRead {
    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        uint256 startingDate;
        uint256 maturityDate;
    }

    struct PrincipalFor {
        uint256 numerator;
        uint256 denominator;
    }

    /**
     * @notice Retrieves the bond details
     */
    function getBondDetails() external view returns (BondDetailsData memory bondDetailsData_);

    /**
     * @notice Retrieves principal numerator and denominator for a specific account
     */
    function getPrincipalFor(address _account) external view returns (PrincipalFor memory principalFor_);
}
