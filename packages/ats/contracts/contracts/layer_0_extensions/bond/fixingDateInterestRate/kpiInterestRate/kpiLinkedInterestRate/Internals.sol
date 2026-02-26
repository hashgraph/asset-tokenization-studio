// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../../../../layer_2/interfaces/bond/IBondRead.sol";
import { ModifiersKpiLinkedInterestRate } from "./Modifiers.sol";

abstract contract InternalsKpiLinkedInterestRate is ModifiersKpiLinkedInterestRate {
    // ===== Bond Methods =====
    function _setKpiLinkedInterestRate(uint256 _couponID) internal virtual;

    function _calculateKpiLinkedInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view virtual returns (uint256 rate_, uint8 rateDecimals);
}
