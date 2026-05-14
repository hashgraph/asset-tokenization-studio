// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AssetModifiers } from "./asset/AssetModifiers.sol";
import { CoreModifiers } from "./core/CoreModifiers.sol";
import { DatesValidation } from "../infrastructure/utils/DatesValidation.sol";

/**
 * @title Modifiers
 * @notice Aggregates reusable core and asset-level modifiers for inheriting contracts.
 * @dev Provides a single inheritance point for common access, pause, compliance, asset
 *      and validation restrictions. Inheriting contracts also receive modifiers declared
 *      by `CoreModifiers` and `AssetModifiers`.
 * @author Asset Tokenization Studio Team
 */
abstract contract Modifiers is CoreModifiers, AssetModifiers {
    /**
     * @notice Ensures that the supplied dates satisfy the expected chronological constraints.
     * @dev Delegates validation to `DatesValidation` and reverts with its errors when the dates
     *      are invalid. Does not mutate state and must run before the modified function body.
     * @param _firstDate First timestamp or date value to validate.
     * @param _secondDate Second timestamp or date value to validate against `_firstDate`.
     */
    modifier validateDates(uint256 _firstDate, uint256 _secondDate) {
        DatesValidation.checkDates(_firstDate, _secondDate);
        _;
    }
}
