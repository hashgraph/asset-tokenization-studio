// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAdjusted } from "./ICoreAdjusted.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _CORE_ADJUSTED_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CoreAdjusted
 * @notice Abstract implementation of the CoreAdjusted domain, providing time-adjusted decimal
 *         reads that account for pending scheduled balance adjustments (ABAFs).
 * @dev Inherits `ICoreAdjusted` and delegates entirely to `ERC20StorageWrapper.decimalsAdjustedAt`.
 *      Designed to be inherited by `CoreAdjustedFacet` in the Diamond pattern. Contains no
 *      storage of its own; all state is managed by `ERC20StorageWrapper`.
 */
abstract contract CoreAdjusted is ICoreAdjusted, Modifiers {
    /// @inheritdoc ICoreAdjusted
    function initializeCoreAdjusted()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_CORE_ADJUSTED_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_CORE_ADJUSTED_RESOLVER_KEY);
        emit CoreAdjustedInitialized();
    }

    /**
     * @notice Returns the effective token decimals at the given timestamp, simulating pending
     *         scheduled balance adjustments (ABAFs) up to and including that timestamp.
     * @dev Forwards to `ERC20StorageWrapper.decimalsAdjustedAt`. No state is mutated.
     * @param _timestamp The Unix timestamp up to which pending ABAFs are simulated.
     * @return The effective decimal precision of the token at the specified timestamp.
     */
    function decimalsAt(uint256 _timestamp) external view override returns (uint8) {
        return ERC20StorageWrapper.decimalsAdjustedAt(_timestamp);
    }
}
