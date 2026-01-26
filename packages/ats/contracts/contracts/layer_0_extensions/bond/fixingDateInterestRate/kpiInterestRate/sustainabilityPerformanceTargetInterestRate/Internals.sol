// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CheckpointsLib } from "contracts/layer_0/common/libraries/CheckpointsLib.sol";
import { ModifiersSustainabilityPerformanceTargetInterestRate } from "./Modifiers.sol";
import { IBondRead } from "contracts/layer_2/interfaces/bond/IBondRead.sol";

abstract contract InternalsSustainabilityPerformanceTargetInterestRate is
    ModifiersSustainabilityPerformanceTargetInterestRate
{
    // ===== Bond Methods =====
    function _setSustainabilityPerformanceTargetInterestRate(uint256 _couponID) internal virtual;

    function _calculateSustainabilityPerformanceTargetInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view virtual returns (uint256 rate_, uint8 rateDecimals);
}
