// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IBondStorageWrapper {
    event CouponSet(
        bytes32 corporateActionId,
        uint256 couponId,
        address indexed operator,
        uint256 indexed recordDate,
        uint256 indexed executionDate,
        uint256 rate
    );

    error CouponCreationFailed();
    error CouponFirstDateWrong();
    error CouponFrequencyWrong();
}
