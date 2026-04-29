// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreeze } from "./IFreeze.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Freeze
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing address and partial token freeze logic for a security
 *         token. Supports both address-level freezing (blocking all operations) and
 *         amount-level freezing (locking a specific token balance).
 * @dev Implements `IFreeze`. Freeze state is delegated to `ERC3643StorageWrapper`. Partial
 *      freeze/unfreeze operations are restricted to single-partition tokens via the
 *      `onlyWithoutMultiPartition` modifier. All mutating functions require `FREEZE_MANAGER_ROLE`
 *      or `AGENT_ROLE` via `onlyFreezeRoles`. `getFrozenTokens` delegates timestamp resolution
 *      to `TimeTravelStorageWrapper` so the same code path is exercisable in test environments.
 *      Intended to be inherited exclusively by `FreezeFacet`.
 */
abstract contract Freeze is IFreeze, Modifiers {
    /// @inheritdoc IFreeze
    function setAddressFrozen(
        address _userAddress,
        bool _freezStatus
    )
        external
        override
        onlyUnpaused
        notZeroAddress(_userAddress)
        onlyUnrecoveredAddress(_userAddress)
        onlyFreezeRoles(EvmAccessors.getMsgSender())
    {
        ERC3643StorageWrapper.setAddressFrozen(_userAddress, _freezStatus);
        emit AddressFrozen(_userAddress, _freezStatus, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc IFreeze
    function freezePartialTokens(
        address _userAddress,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_userAddress)
        notZeroAddress(_userAddress)
        onlyWithoutMultiPartition
        onlyFreezeRoles(EvmAccessors.getMsgSender())
    {
        ERC3643StorageWrapper.freezeTokens(_userAddress, _amount);
        emit TokensFrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    /// @inheritdoc IFreeze
    function unfreezePartialTokens(
        address _userAddress,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_userAddress)
        notZeroAddress(_userAddress)
        onlyWithoutMultiPartition
        onlyFreezeRoles(EvmAccessors.getMsgSender())
    {
        ERC3643StorageWrapper.unfreezeTokens(_userAddress, _amount, 0);
        emit TokensUnfrozen(_userAddress, _amount, _DEFAULT_PARTITION);
    }

    /// @inheritdoc IFreeze
    function getFrozenTokens(address _userAddress) external view override returns (uint256) {
        return
            ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(
                _userAddress,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
