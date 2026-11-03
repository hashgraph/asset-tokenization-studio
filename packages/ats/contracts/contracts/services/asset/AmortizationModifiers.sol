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

    /// @notice Reverts when the target amortization's raw hold-accounting LABAF is already migrated.
    /// @dev Delegates to `AmortizationStorageWrapper.checkAmortizationHoldAccountingNotMigrated`;
    ///      guards `migrateAmortizationHoldAccounting` against a second, non-idempotent call.
    /// @param _amortizationID The amortization event identifier under inspection.
    modifier onlyNotMigratedAmortizationHoldAccounting(uint256 _amortizationID) {
        AmortizationStorageWrapper.checkAmortizationHoldAccountingNotMigrated(_amortizationID);
        _;
    }

    /// @notice Reverts when the supplied migration LABAF is not strictly positive.
    /// @dev Delegates to `AmortizationStorageWrapper.checkPositiveMigrationLabaf`; a zero LABAF
    ///      would recreate the "never held" ambiguity the migration exists to resolve.
    /// @param _labaf           The candidate migration LABAF.
    /// @param _amortizationID  The amortization event identifier the LABAF belongs to.
    modifier onlyPositiveMigrationLabaf(uint256 _labaf, uint256 _amortizationID) {
        AmortizationStorageWrapper.checkPositiveMigrationLabaf(_labaf, _amortizationID);
        _;
    }

    /// @notice Reverts when the supplied migration LABAF exceeds the current ABAF.
    /// @dev Delegates to `AmortizationStorageWrapper.checkMigrationLabafWithinAbaf`; a LABAF
    ///      above the current ABAF would truncate `abaf / labaf` to `0` on the next sync.
    /// @param _labaf           The candidate migration LABAF.
    /// @param _amortizationID  The amortization event identifier the LABAF belongs to.
    modifier onlyMigrationLabafWithinAbaf(uint256 _labaf, uint256 _amortizationID) {
        AmortizationStorageWrapper.checkMigrationLabafWithinAbaf(_labaf, _amortizationID);
        _;
    }

    /// @notice Reverts when the supplied migration total exceeds the token's current total supply.
    /// @dev Delegates to `AmortizationStorageWrapper.checkAmortizationHoldAccountingTotalWithinSupply`;
    ///      guards against an operator input error seeding an impossibly large total that would
    ///      later brick amortization hold operations, since the migration is one-shot.
    /// @param _total           The candidate migration total.
    /// @param _amortizationID  The amortization event identifier the total belongs to.
    modifier onlyMigrationTotalWithinSupply(uint256 _total, uint256 _amortizationID) {
        AmortizationStorageWrapper.checkAmortizationHoldAccountingTotalWithinSupply(_total, _amortizationID);
        _;
    }
}
