// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";

/**
 * @title ERC1410Modifiers
 * @dev Abstract contract providing ERC1410-specific modifiers
 *
 * This contract wraps ERC1410StorageWrapper library functions into modifiers
 * for convenient use in facets.
 *
 * @notice Inherit from this contract to gain access to ERC1410 validation modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ERC1410Modifiers {
    /**
     * @dev Modifier that validates address is not zero
     *
     * Requirements:
     * - Address must not be the zero address
     *
     * @param _account The address to validate
     */
    modifier onlyValidAddress(address _account) {
        ERC1410StorageWrapper.requireValidAddress(_account);
        _;
    }

    /**
     * @dev Modifier that validates that an account is the operator for a partition
     *
     * @param _partition The partition
     * @param _account The account
     */
    modifier onlyOperator(bytes32 _partition, address _account) {
        ERC1410StorageWrapper.requireOperator(_partition, _account);
        _;
    }
}
