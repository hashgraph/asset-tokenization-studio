// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IRecovery } from "./IRecovery.sol";
import { AGENT_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _RECOVERY_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

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
        onlyFacetNotRegistered(_RECOVERY_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_RECOVERY_RESOLVER_KEY);
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
        onlyRole(AGENT_ROLE)
        onlyUnrecoveredAddress(_lostWallet)
        onlyEmptyWallet(_lostWallet)
        onlyWithoutMultiPartition
        returns (bool success_)
    {
        success_ = ERC3643StorageWrapper.recoveryAddress(
            _lostWallet,
            _newWallet,
            _investorOnchainID,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }

    /// @inheritdoc IRecovery
    function isAddressRecovered(address _wallet) external view override returns (bool) {
        return ERC3643StorageWrapper.isRecovered(_wallet);
    }
}
