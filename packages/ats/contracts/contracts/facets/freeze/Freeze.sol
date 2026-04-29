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
 * @notice Abstract contract for freezing addresses and partial tokens
 *
 * Provides functionality for freezing addresses and partial token amounts
 * with role-based access control. Inherits ERC3643Modifiers for compliance checks.
 */
abstract contract Freeze is IFreeze, Modifiers {
    /**
     * @notice Set address frozen status
     * @dev Only callable by FREEZE_MANAGER_ROLE or AGENT_ROLE
     *
     * Requirements:
     * - Address must be valid
     * - Caller must have FREEZE_MANAGER_ROLE or AGENT_ROLE
     * - Address must not be recovered
     *
     * @param _userAddress The address to freeze/unfreeze
     * @param _freezStatus True to freeze, false to unfreeze
     */
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

    /**
     * @notice Freeze partial tokens for address
     * @dev Only callable when not paused
     *
     * Requirements:
     * - Address must be valid
     * - Address must not be recovered
     * - Token must not use multi-partition
     *
     * @param _userAddress The address to freeze tokens for
     * @param _amount The amount to freeze
     */
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

    /**
     * @notice Unfreeze partial tokens for address
     * @dev Only callable when not paused
     *
     * Requirements:
     * - Address must be valid
     * - Address must not be recovered
     * - Token must not use multi-partition
     *
     * @param _userAddress The address to unfreeze tokens for
     * @param _amount The amount to unfreeze
     */
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

    /**
     * @notice Get frozen tokens for address
     * @param _userAddress The address to query
     * @return Frozen token amount
     */
    function getFrozenTokens(address _userAddress) external view override returns (uint256) {
        return
            ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(
                _userAddress,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
