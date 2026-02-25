// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title TimestampProvider
/// @notice Production-grade abstract contract providing block.timestamp and block.number access.
/// @dev Facets inherit this and call _getBlockTimestamp() / _getBlockNumber() instead of using
///      block.timestamp / block.number directly. In production the default implementations are
///      used (returning native values). In tests, TimeTravelProvider overrides them to read from
///      well-known storage slots, enabling deterministic time travel.
abstract contract TimestampProvider {
    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _getBlockNumber() internal view virtual returns (uint256) {
        return block.number;
    }
}
