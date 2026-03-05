// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { LibPause } from "../../../domain/core/LibPause.sol";
import { LibAccess } from "../../../domain/core/LibAccess.sol";
import { LibCap } from "../../../domain/core/LibCap.sol";
import { LibSnapshots } from "../../../domain/assets/LibSnapshots.sol";
import { LibERC1410 } from "../../../domain/assets/LibERC1410.sol";
import { LibERC20 } from "../../../domain/assets/LibERC20.sol";
import { LibABAF } from "../../../domain/assets/LibABAF.sol";
import { LibScheduledTasks } from "../../../domain/assets/LibScheduledTasks.sol";
import { _ADJUSTMENT_BALANCE_ROLE } from "../../../constants/roles.sol";

/// @title AdjustBalances
/// @notice Abstract business logic for adjusting balances of all users by a given factor and decimals
/// @dev Library-based: uses LibPause, LibAccess, and domain libraries instead of inheritance
abstract contract AdjustBalances is IAdjustBalances {
    function adjustBalances(uint256 factor, uint8 decimals) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_ADJUSTMENT_BALANCE_ROLE, msg.sender);

        if (factor == 0) {
            revert IAdjustBalances.FactorIsZero();
        }

        LibScheduledTasks.callTriggerPending();

        LibSnapshots.updateDecimalsSnapshot();
        LibSnapshots.updateAbafSnapshot();
        LibSnapshots.updateAssetTotalSupplySnapshot();

        LibERC1410.adjustTotalSupply(factor);
        LibERC20.adjustDecimals(decimals);
        LibCap.adjustMaxSupply(factor);
        LibABAF.updateAbaf(factor);

        emit IAdjustBalances.AdjustmentBalanceSet(msg.sender, factor, decimals);

        success_ = true;
    }
}
