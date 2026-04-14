// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title IBondTypes
/// @notice Single source of truth for all Bond domain types (structs, enums, events, errors)
interface IBondTypes {
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

    event MaturityDateUpdated(
        address indexed bondId,
        uint256 indexed maturityDate,
        uint256 indexed previousMaturityDate
    );

    error BondMaturityDateWrong();
}
