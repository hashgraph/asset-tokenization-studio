// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "../interfaces/adjustBalances/IAdjustBalances.sol";
import { IAdjustBalancesStorageWrapper } from "../interfaces/adjustBalances/IAdjustBalancesStorageWrapper.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCap } from "../../../lib/core/LibCap.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC20 } from "../../../lib/domain/LibERC20.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibScheduledTasks } from "../../../lib/domain/LibScheduledTasks.sol";
import { _ADJUSTMENT_BALANCE_ROLE } from "../../../constants/roles.sol";

/// @title AdjustBalancesFacetBase
/// @notice Facet for adjusting balances of all users by a given factor and decimals
/// @dev Library-based facet: uses LibPause, LibAccess, and domain libraries instead of inheritance
abstract contract AdjustBalancesFacetBase is IAdjustBalances, IStaticFunctionSelectors {
    /// @notice Adjusts the balances of all users by a given factor and decimals
    /// @param factor The adjustment factor (must be non-zero)
    /// @param decimals The new decimals value
    /// @return success_ Always true if function completes without reverting
    /// @dev This action is triggered immediately, contrary to scheduled methods that add tasks to the queue
    /// @dev Requires token to not be paused and caller to have ADJUSTMENT_BALANCE_ROLE
    function adjustBalances(uint256 factor, uint8 decimals) external override returns (bool success_) {
        // Guard: Check token is not paused
        LibPause.requireNotPaused();

        // Guard: Check caller has ADJUSTMENT_BALANCE_ROLE
        LibAccess.checkRole(_ADJUSTMENT_BALANCE_ROLE, msg.sender);

        // Guard: Validate factor is non-zero
        if (factor == 0) {
            revert IAdjustBalancesStorageWrapper.FactorIsZero();
        }

        // Trigger any pending scheduled cross-ordered tasks
        LibScheduledTasks.callTriggerPending();

        // Update snapshots
        LibSnapshots.updateDecimalsSnapshot();
        LibSnapshots.updateAbafSnapshot();
        LibSnapshots.updateAssetTotalSupplySnapshot();

        // Adjust balances across all domain libraries
        LibERC1410.adjustTotalSupply(factor);
        LibERC20.adjustDecimals(decimals);
        LibCap.adjustMaxSupply(factor);
        LibABAF.updateAbaf(factor);

        // Emit adjustment event
        emit IAdjustBalancesStorageWrapper.AdjustmentBalanceSet(msg.sender, factor, decimals);

        success_ = true;
    }

    /// @notice Returns the static function selectors for this facet
    /// @return staticFunctionSelectors_ Array containing the adjustBalances selector
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[0] = this.adjustBalances.selector;
    }

    /// @notice Returns the static interface IDs supported by this facet
    /// @return staticInterfaceIds_ Array containing the IAdjustBalances interface ID
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IAdjustBalances).interfaceId;
    }
}
