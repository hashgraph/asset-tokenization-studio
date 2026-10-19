// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DefaultValueValidation } from "../../infrastructure/utils/DefaultValueValidation.sol";

/**
 * @title DefaultValuesModifiers
 * @dev Abstract contract providing mandatory default value modifiers
 *
 * This contract provides reusable modifiers for validating default values.
 * All facets should inherit from this contract to ensure
 * consistent default value handling across the codebase.
 *
 * @notice Modifiers are MANDATORY unless compilation fails or bytecode exceeds limits
 * @author Asset Tokenization Studio Team
 */
abstract contract DefaultValuesModifiers {
    /**
     * @dev Modifier that validates address is not zero address
     *
     * Requirements:
     * - _address must not be the zero address
     *
     * @param _address The address to check for
     */
    modifier validateAddressNotZero(address _address) {
        DefaultValueValidation.checkZeroAddress(_address);
        _;
    }

    /**
     * @dev Modifier that validates a uint256 value is not zero
     *
     * Requirements:
     * - _value must not be zero
     *
     * @param _value The value to check
     */
    modifier validateUint256NotZero(uint256 _value) {
        DefaultValueValidation.checkZeroValue(_value);
        _;
    }

    /**
     * @notice Reverts if the two supplied lengths are not equal.
     * @dev Validates collection or array lengths using `DefaultValueValidation.checkWithSameLength`.
     * @param _length1 The length of the first collection or array.
     * @param _length2 The length of the second collection or array.
     */
    modifier onlyWithSameLength(uint256 _length1, uint256 _length2) {
        DefaultValueValidation.checkWithSameLength(_length1, _length2);
        _;
    }
}
