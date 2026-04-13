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
    enum RateCalculationStatus {
        PENDING,
        SET
    }

    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        uint256 startingDate;
        uint256 maturityDate;
    }

    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 startDate;
        uint256 endDate;
        uint256 fixingDate;
        uint256 rate;
        uint8 rateDecimals;
        RateCalculationStatus rateStatus;
    }

    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    struct CouponFor {
        uint256 tokenBalance;
        uint8 decimals;
        bool recordDateReached;
        Coupon coupon;
        bool isDisabled;
    }

    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
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

    event CouponSet(
        bytes32 indexed corporateActionId,
        uint256 indexed couponId,
        address indexed operator,
        Coupon coupon
    );

    error CouponCreationFailed();
    error BondMaturityDateWrong();
}
