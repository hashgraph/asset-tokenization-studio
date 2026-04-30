// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../errors/ICommonErrors.sol";

/**
 * @title Default Value Validation
 * @notice Utility library for validating that values are not the Solidity default (zero)
 */
library DefaultValueValidation {
    /**
     * @notice Validates that the provided address is not the zero address
     * @param _address The address to validate
     */
    function checkZeroAddress(address _address) internal pure {
        if (_address == address(0)) {
            revert ICommonErrors.ZeroAddressNotAllowed();
        }
    }

    /**
     * @notice Validates that the provided uint256 is not zero
     * @param _value The value to validate
     */
    function checkZeroValue(uint256 _value) internal pure {
        if (_value == 0) {
            revert ICommonErrors.ZeroValueNotAllowed();
        }
    }
}
