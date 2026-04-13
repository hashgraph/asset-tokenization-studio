// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title CapModifiers
 * @notice Abstract contract providing cap-related modifiers
 * @dev Provides modifiers for cap validation using _check* pattern
 *      from CapStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract CapModifiers {
    /// @notice Modifier to ensure cap has not been initialized
    /// @dev Calls _checkNotCapInitialized from CapStorageWrapper
    modifier onlyNotCapInitialized() {
        _checkNotInitialized(CapStorageWrapper.isCapInitialized());
        _;
    }

    /**
     * @dev Modifier that verifies the issuance amount does not exceed the
     * maximum supply cap adjusted at the given timestamp.
     *
     * Requirements:
     * - The current total supply plus `_value` must not exceed the max supply
     *   effective at `_timestamp`.
     *
     * @param _value The amount to be issued.
     * @param _timestamp The timestamp at which the max supply cap is evaluated.
     */
    modifier onlyWithinMaxSupply(uint256 _value, uint256 _timestamp) {
        CapStorageWrapper.requireWithinMaxSupply(_value, _timestamp);
        _;
    }

    /**
     * @dev Modifier that validates that minting an amount does not exceed
     *      the maximum supply cap for a specific partition at a given timestamp
     *
     * Requirements:
     * - The partition's current total supply plus the amount must not exceed
     *   the partition's maximum supply cap adjusted at the given timestamp
     *
     * @param _partition The partition to check the supply cap for
     * @param _amount The amount to be minted
     * @param _timestamp The timestamp at which to evaluate the cap
     */
    modifier onlyWithinMaxSupplyByPartition(bytes32 _partition, uint256 _amount, uint256 _timestamp) {
        CapStorageWrapper.requireWithinMaxSupplyByPartition(_partition, _amount, _timestamp);
        _;
    }

    /**
     * @dev Modifier that verifies the new maximum supply is valid.
     *
     * Requirements:
     * - `_maxSupply` must be greater than zero.
     * - `_maxSupply` must be greater than or equal to the total supply
     *   adjusted at `_timestamp`.
     *
     * @param _maxSupply The new maximum supply value to validate.
     * @param _timestamp The timestamp at which the total supply is evaluated.
     */
    modifier onlyValidNewMaxSupply(uint256 _maxSupply, uint256 _timestamp) {
        CapStorageWrapper.requireValidNewMaxSupply(_maxSupply, _timestamp);
        _;
    }

    /**
     * @dev Modifier that verifies the new maximum supply for a partition is valid.
     *
     * Requirements:
     * - If `_maxSupply` is zero, the check is skipped (no partition cap enforced).
     * - `_maxSupply` must be greater than or equal to the partition's total supply
     *   adjusted at `_timestamp`.
     * - `_maxSupply` must not exceed the overall token max supply at `_timestamp`.
     *
     * @param _partition The partition identifier to validate the cap for.
     * @param _maxSupply The new maximum supply value for the partition.
     * @param _timestamp The timestamp at which supplies are evaluated.
     */
    modifier onlyValidNewMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply, uint256 _timestamp) {
        CapStorageWrapper.requireValidNewMaxSupplyByPartition(_partition, _maxSupply, _timestamp);
        _;
    }
}
