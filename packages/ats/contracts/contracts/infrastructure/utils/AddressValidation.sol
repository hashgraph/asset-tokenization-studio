// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../errors/ICommonErrors.sol";

/**
 * @title Address Validation
 * @notice Utility library for address validation
 */
library AddressValidation {
    /**
     * @notice Validates that the provided address is not the zero address
     * @param _address The address to validate
     */
    function checkZeroAddress(address _address) internal pure {
        if (_address == address(0)) {
            revert ICommonErrors.ZeroAddressNotAllowed();
        }
    }
}
