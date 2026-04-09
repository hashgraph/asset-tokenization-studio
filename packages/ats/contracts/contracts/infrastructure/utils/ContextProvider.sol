// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EvmAccessors } from "./EvmAccessors.sol";

/// @title ContextProvider
/// @notice Abstract contract providing encapsulated EVM context accessors.
/// @dev Facets should inherit from this to use _msgSender(), _txOrigin(), _getChainId()
///      instead of msg.sender, tx.origin, block.chainid directly.
///      This allows test-time overrides via EvmAccessors library (similar to TimeTravelStorageWrapper).
/// @dev Similar pattern to TimestampProvider for block.timestamp/block.number.
abstract contract ContextProvider {
    /// @notice Returns the effective sender address with test override support.
    /// @return The sender address (msg.sender or test override)
    function _msgSender() internal view virtual returns (address) {
        return EvmAccessors.getMsgSender();
    }

    /// @notice Returns the effective transaction origin with test override support.
    /// @return The origin address (tx.origin or test override)
    function _txOrigin() internal view virtual returns (address) {
        return EvmAccessors.getTxOrigin();
    }

    /// @notice Returns the effective chain ID with test override support.
    /// @return The chain ID (block.chainid or test override)
    function _getChainId() internal view virtual returns (uint256) {
        return EvmAccessors.getChainId();
    }
}
