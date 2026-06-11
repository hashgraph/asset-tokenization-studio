// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IRecovery, RESOLVER_KEY_RECOVERY } from "./IRecovery.sol";
import { IERC3643Types } from "../commonTypes/IERC3643Types.sol";
import { IAccessControl } from "../accessControl/IAccessControl.sol";
import { ROLE_AGENT } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
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
    /// @dev Besides `RecoverySuccess`, emits a `RoleGranted` (new wallet) for each role newly
    ///      granted and a `RoleRevoked` (lost wallet) for each role removed, so role-membership
    ///      indexers stay consistent. These `IAccessControl` events are downstream of the recovery
    ///      operation and fire only when the lost wallet actually held roles. Grants are emitted
    ///      before revocations to mirror the storage mutation order (grant before revoke), so an
    ///      event-only observer never sees a role transiently drop to zero holders.
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
        onlyDifferentWallets(_lostWallet, _newWallet)
        onlyEmptyWallet(_lostWallet)
        onlyWithoutMultiPartition
        returns (bool success_)
    {
        (bytes32[] memory grantedRoles, bytes32[] memory revokedRoles) = ERC3643StorageWrapper.recoveryAddress(
            _lostWallet,
            _newWallet,
            EvmAccessors.getBlockTimestamp()
        );
        emit IERC3643Types.RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
        _emitRoleMigrationEvents(_lostWallet, _newWallet, grantedRoles, revokedRoles);
        success_ = true;
    }

    /// @inheritdoc IRecovery
    function isAddressRecovered(address _wallet) external view override returns (bool) {
        return ERC3643StorageWrapper.isRecovered(_wallet);
    }

    /**
     * @notice Emits the per-role `RoleGranted` / `RoleRevoked` events for a wallet recovery.
     * @dev Extracted to a `private` helper so the external `recoveryAddress` entry point's stack
     *      stays within the Solidity 16-slot limit. Grants are emitted before revocations to
     *      mirror the storage mutation order (grant before revoke), so an event-only observer
     *      never sees a role transiently drop to zero holders.
     * @param _lostWallet Wallet the roles were revoked from.
     * @param _newWallet Wallet the roles were granted to.
     * @param _grantedRoles Roles newly granted to `_newWallet`.
     * @param _revokedRoles Roles removed from `_lostWallet`.
     */
    function _emitRoleMigrationEvents(
        address _lostWallet,
        address _newWallet,
        bytes32[] memory _grantedRoles,
        bytes32[] memory _revokedRoles
    ) private {
        address operator = EvmAccessors.getMsgSender();
        uint256 grantedLength = _grantedRoles.length;
        for (uint256 index; index < grantedLength; ) {
            emit IAccessControl.RoleGranted(operator, _newWallet, _grantedRoles[index]);
            unchecked {
                ++index;
            }
        }
        uint256 revokedLength = _revokedRoles.length;
        for (uint256 index; index < revokedLength; ) {
            emit IAccessControl.RoleRevoked(operator, _lostWallet, _revokedRoles[index]);
            unchecked {
                ++index;
            }
        }
    }
}
