// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @notice Auxiliary enum used to keep track of the party initating a hold or clearing
 * @dev Its primary intended use is to know whether the allowance should be returned or not
 */

enum ThirdPartyType {
    NULL,
    AUTHORIZED,
    OPERATOR,
    PROTECTED,
    CONTROLLER
}
