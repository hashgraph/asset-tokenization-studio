// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/bond/IBondTypes.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/// @title IBondTypes
/// @notice Single source of truth for all Bond domain types (structs, enums, events, errors)
interface TRexIBondTypes {
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
