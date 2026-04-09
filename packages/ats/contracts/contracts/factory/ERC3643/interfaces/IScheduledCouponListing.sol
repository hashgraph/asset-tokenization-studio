// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_1/scheduledCouponListing/IScheduledCouponListing.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { ScheduledTask } from "./IScheduledTasksCommon.sol";

interface TRexIScheduledCouponListing {
    function scheduledCouponListingCount() external view returns (uint256);

    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledCouponListing_);
}
