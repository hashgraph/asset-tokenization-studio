// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "../interfaces/adjustBalances/IAdjustBalances.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCap } from "../../../lib/core/LibCap.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC20 } from "../../../lib/domain/LibERC20.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibScheduledTasks } from "../../../lib/domain/LibScheduledTasks.sol";
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
