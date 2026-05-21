// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAllowance } from "./IAllowance.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _ALLOWANCE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title Allowance
 * @notice Implementation of the Allowance domain. Delegates into the existing
 *         `ERC20StorageWrapper` so semantics match the legacy `ERC20` facet exactly
 *         during the transition period.
 */
abstract contract Allowance is IAllowance, Modifiers {
    /// @inheritdoc IAllowance
    function initializeAllowance()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_ALLOWANCE_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_ALLOWANCE_RESOLVER_KEY);
        emit IAllowance.AllowanceInitialized();
    }

    /**
     * @inheritdoc IAllowance
     * @dev Restricted to unpaused state, non-recovered caller and spender, tokens without
     *      multi-partition configuration, and compliant caller/spender pairs. Delegates to
     *      {ERC20StorageWrapper-approve} using the authenticated sender resolved via
     *      {EvmAccessors-getMsgSender}.
     */
    function approve(
        address spender,
        uint256 value
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return TokenCoreOps.approve(EvmAccessors.getMsgSender(), spender, value);
    }

    /**
     * @inheritdoc IAllowance
     * @dev Restricted to unpaused state, tokens without multi-partition configuration, and
     *      compliant caller/spender pairs. Delegates to {ERC20StorageWrapper-increaseAllowance}.
     */
    function increaseAllowance(
        address spender,
        uint256 addedValue
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return TokenCoreOps.increaseAllowance(spender, addedValue);
    }

    /**
     * @inheritdoc IAllowance
     * @dev Restricted to unpaused state, tokens without multi-partition configuration, and
     *      compliant caller/spender pairs. Delegates to {ERC20StorageWrapper-decreaseAllowance}.
     */
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyCompliant(EvmAccessors.getMsgSender(), spender, false)
        returns (bool)
    {
        return TokenCoreOps.decreaseAllowance(spender, subtractedValue);
    }

    /**
     * @inheritdoc IAllowance
     * @dev Reads the historical allowance at the current time-travel-adjusted block timestamp,
     *      so snapshot-aware facets observe a consistent view with the rest of the token
     *      storage.
     */
    function allowance(address owner, address spender) external view override returns (uint256) {
        return ERC20StorageWrapper.allowanceAdjustedAt(owner, spender, TimeTravelStorageWrapper.getBlockTimestamp());
    }
}
