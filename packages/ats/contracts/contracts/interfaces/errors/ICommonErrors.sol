// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ICommonErrors
 * @dev Common custom errors used across multiple contracts
 */
interface ICommonErrors {
    error BondMaturityDateWrong(string reason);
    error ClearingIsActivated();
    error WrongExpirationTimestamp();
    error WrongDates(string reason);
}
