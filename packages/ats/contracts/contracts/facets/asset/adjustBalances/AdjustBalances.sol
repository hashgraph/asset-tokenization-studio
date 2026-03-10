// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../domain/asset/ERC20StorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { _ADJUSTMENT_BALANCE_ROLE } from "../../../constants/roles.sol";

/// @title AdjustBalances
/// @notice Abstract business logic for adjusting balances of all users by a given factor and decimals
/// @dev Library-based: uses PauseStorageWrapper, AccessStorageWrapper, and domain libraries instead of inheritance
abstract contract AdjustBalances is IAdjustBalances {
    function adjustBalances(uint256 factor, uint8 decimals) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_ADJUSTMENT_BALANCE_ROLE, msg.sender);

        if (factor == 0) {
            revert IAdjustBalances.FactorIsZero();
        }

        ScheduledTasksStorageWrapper.callTriggerPending();

        SnapshotsStorageWrapper.updateDecimalsSnapshot();
        SnapshotsStorageWrapper.updateAbafSnapshot();
        SnapshotsStorageWrapper.updateAssetTotalSupplySnapshot();

        ERC1410StorageWrapper.adjustTotalSupply(factor);
        ERC20StorageWrapper.adjustDecimals(decimals);
        CapStorageWrapper.adjustMaxSupply(factor);
        ABAFStorageWrapper.updateAbaf(factor);

        emit IAdjustBalances.AdjustmentBalanceSet(msg.sender, factor, decimals);

        success_ = true;
    }
}
