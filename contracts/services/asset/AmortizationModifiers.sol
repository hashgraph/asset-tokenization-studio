// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AmortizationStorageWrapper } from "../../domain/asset/AmortizationStorageWrapper.sol";

/// @title AmortizationModifiers
/// @author Asset Tokenization Studio Team
/// @notice Reusable function modifiers protecting amortization-event operations.
/// @dev Each modifier defers its check to `AmortizationStorageWrapper`, keeping the
///      revert logic centralised alongside the storage it inspects.
abstract contract AmortizationModifiers {
    /// @notice Reverts when the target amortization event still holds active token holds.
    /// @dev Calls `AmortizationStorageWrapper.checkNoActiveAmortizationHolds` and reverts
    ///      with the wrapper-defined error when the invariant is violated.
    /// @param _amortizationID The amortization event identifier under inspection.
    modifier onlyNoActiveAmortizationHolds(uint256 _amortizationID) {
        AmortizationStorageWrapper.checkNoActiveAmortizationHolds(_amortizationID);
        _;
    }

    /// @notice Reverts when the supplied token amount is not strictly positive for the event.
    /// @dev Delegates to `AmortizationStorageWrapper.checkPositiveTokenAmount`; intended for
    ///      guarding payout helpers that must never operate on a zero balance.
    /// @param _tokenAmount     The token amount being processed.
    /// @param _amortizationID  The amortization event identifier the amount belongs to.
    modifier onlyPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) {
        AmortizationStorageWrapper.checkPositiveTokenAmount(_tokenAmount, _amortizationID);
        _;
    }
}
