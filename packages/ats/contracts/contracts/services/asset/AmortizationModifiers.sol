// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AmortizationStorageWrapper } from "../../domain/asset/amortization/AmortizationStorageWrapper.sol";
import { IAmortizationStorageWrapper } from "../../domain/asset/amortization/IAmortizationStorageWrapper.sol";

/**
 * @title Amortization Modifiers
 * @notice Provides guard modifiers for amortization-related operations.
 * @dev Abstract contract intended for inheritance by facets that manage amortisation hold
 *      creation and cancellation. Delegates validation to `AmortizationStorageWrapper`.
 * @author io.builders
 */
abstract contract AmortizationModifiers {
    /**
     * @notice Reverts if the given amortisation has any active holds.
     * @dev Delegates to `AmortizationStorageWrapper.checkNoActiveAmortizationHolds`.
     *      Reverts with `AmortizationHasActiveHolds` when at least one hold is still pending.
     * @param _amortizationID The identifier of the amortisation to check.
     */
    modifier onlyNoActiveAmortizationHolds(uint256 _amortizationID) {
        AmortizationStorageWrapper.checkNoActiveAmortizationHolds(_amortizationID);
        _;
    }

    /**
     * @notice Reverts if the given token amount is zero for the specified amortisation.
     * @dev Delegates to `AmortizationStorageWrapper.checkPositiveTokenAmount`.
     *      Reverts with `InvalidAmortizationHoldAmount` when `_tokenAmount` is zero.
     * @param _tokenAmount    The token amount to validate.
     * @param _amortizationID The identifier of the amortisation being operated on.
     */
    modifier onlyPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) {
        AmortizationStorageWrapper.checkPositiveTokenAmount(_tokenAmount, _amortizationID);
        _;
    }
}
