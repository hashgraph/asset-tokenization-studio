// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAllowance, RESOLVER_KEY_ALLOWANCE } from "./IAllowance.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Allowance Facet
 * @notice Implements ERC-20 allowance operations for non-partitioned security tokens.
 * @dev Delegates allowance mutations to `TokenCoreOps` and reads allowance snapshots from
 *      `ERC20StorageWrapper`. The facet must be registered once through the initializer flow
 *      before the token can become operational.
 * @author Asset Tokenization Studio Team
 */
abstract contract Allowance is IAllowance, Modifiers {
    /// @inheritdoc IAllowance
    /// @dev Restricted to `DEFAULT_ADMIN_ROLE` and callable only before this facet is registered.
    function initializeAllowance()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_ALLOWANCE)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_ALLOWANCE);
        emit IAllowance.AllowanceInitialized();
    }

    /// @inheritdoc IAllowance
    /// @dev Requires the token to be operational, activated, unpaused, and not configured for
    ///      multi-partition behaviour. The authenticated sender and spender must satisfy
    ///      compliance checks before the allowance is updated.
    function approve(
        address spender,
        uint256 value
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return TokenCoreOps.approve(EvmAccessors.getMsgSender(), spender, value);
    }

    /// @inheritdoc IAllowance
    /// @dev Requires the token to be operational, activated, unpaused, and not configured for
    ///      multi-partition behaviour. The authenticated sender and spender must satisfy
    ///      compliance checks before the allowance is increased.
    function increaseAllowance(
        address spender,
        uint256 addedValue
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return TokenCoreOps.increaseAllowance(spender, addedValue);
    }

    /// @inheritdoc IAllowance
    /// @dev Requires the token to be operational, activated, unpaused, and not configured for
    ///      multi-partition behaviour. The authenticated sender and spender must satisfy
    ///      compliance checks before the allowance is decreased.
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return TokenCoreOps.decreaseAllowance(spender, subtractedValue);
    }

    /// @inheritdoc IAllowance
    /// @dev Reads the allowance at the current time-travel-adjusted block timestamp so
    ///      snapshot-aware facets observe a consistent storage view.
    function allowance(address owner, address spender) external view override returns (uint256) {
        return ERC20StorageWrapper.allowanceAdjustedAt(owner, spender, TimeTravelStorageWrapper.getBlockTimestamp());
    }
}
