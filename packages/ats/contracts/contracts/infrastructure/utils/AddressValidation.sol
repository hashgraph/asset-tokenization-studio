// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Address Validation
 * @notice Utility library for address validation
 */
library AddressValidation {
    /**
     * @notice Error thrown when address is zero
     */
    error ZeroAddressNotAllowed();

    /**
     * @notice Validates that the provided address is not the zero address
     * @param _address The address to validate
     */
    function checkZeroAddress(address _address) internal pure {
        if (_address == address(0)) {
            revert ZeroAddressNotAllowed();
        }
    }
}
