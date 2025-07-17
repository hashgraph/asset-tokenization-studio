// SPDX-License-Identifier: BSD-3-Clause-Attribution
pragma solidity 0.8.18;

interface IEip1066 {
    error ExtendedError(
        bytes1 statusCode, // Standard defined status code
        bytes32 reasonCode, // Application specific reason code
        bytes details // Additional details about the error
    );

    error ReasonInsufficientBalance(
        address from, // The address that has insufficient balance
        uint256 fromBalance, // The balance of the address that has insufficient balance
        uint256 value, // The value that was attempted to be transferred
        bytes32 partition // The partition from which the transfer was attempted
    );

    error ReasonAddressRecovered(
        address recoveredAddress // The address that was recovered
    );

    error ReasonAddressInBlacklistOrNotInWhitelist(
        address blockedAddress // The address that is in blacklist or not in whitelist
    );

    error ReasonKycNotGranted(
        address address_ // The address that is not granted KYC
    );
}
