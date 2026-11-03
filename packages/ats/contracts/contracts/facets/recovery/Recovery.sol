// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IRecovery, RESOLVER_KEY_RECOVERY } from "./IRecovery.sol";
import { IERC3643Types } from "../commonTypes/IERC3643Types.sol";
import { ROLE_AGENT } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/// @title Recovery
/// @author Asset Tokenization Studio Team
/// @notice Abstract contract implementing lost-wallet recovery logic.
/// @dev Delegates storage reads and writes to {ERC3643StorageWrapper}. Inherits all access-control
///      and partition-validation modifiers from {Modifiers}.
abstract contract Recovery is IRecovery, Modifiers {
    /// @inheritdoc IRecovery
    function initializeRecovery()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_RECOVERY)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_RECOVERY);
        emit RecoveryInitialized();
    }

    /// @inheritdoc IRecovery
    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_AGENT)
        onlyUnrecoveredAddress(_lostWallet)
        onlyUnrecoveredAddress(_newWallet)
        onlyEmptyWallet(_lostWallet)
        onlyWithoutMultiPartition
        returns (bool success_)
    {
        success_ = ERC3643StorageWrapper.recoveryAddress(
            _lostWallet,
            _newWallet,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        emit IERC3643Types.RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
    }

    /// @inheritdoc IRecovery
    function isAddressRecovered(address _wallet) external view override returns (bool) {
        return ERC3643StorageWrapper.isRecovered(_wallet);
    }
}
