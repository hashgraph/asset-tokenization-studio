// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/equity/IEquity.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

interface TRexIEquity {
    enum DividendType {
        NONE,
        PREFERRED,
        COMMON
    }

    struct EquityDetailsData {
        bool votingRight;
        bool informationRight;
        bool liquidationRight;
        bool subscriptionRight;
        bool conversionRight;
        bool redemptionRight;
        bool putRight;
        DividendType dividendRight;
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
    }

    function getEquityDetails() external view returns (EquityDetailsData memory equityDetailsData_);
}
