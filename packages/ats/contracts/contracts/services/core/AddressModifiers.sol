// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AddressValidation } from "../../infrastructure/utils/AddressValidation.sol";

/**
 * @title AddressModifiers
 * @dev Abstract contract providing mandatory Address modifiers
 *
 * This contract provides reusable modifiers for validating addresses.
 * All facets should inherit from this contract to ensure
 * consistent addresses format across the codebase.
 *
 * @notice Modifiers are MANDATORY unless compilation fails or bytecode exceeds limits
 * @author Hashgraph
 */
abstract contract AddressModifiers {
    /**
     * @dev Modifier that validates address is not zero address
     *
     * Requirements:
     * - _address must not be the zero address
     *
     * @param _address The address to check for
     */
    modifier notZeroAddress(address _address) virtual {
        AddressValidation.checkZeroAddress(_address);
        _;
    }
}
