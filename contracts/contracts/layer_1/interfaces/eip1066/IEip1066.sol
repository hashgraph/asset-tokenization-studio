// SPDX-License-Identifier: BSD-3-Clause-Attribution
pragma solidity 0.8.18;

interface IEip1066 {
    error ExtendedError(
        bytes1 statusCode, // Standard defined status code
        bytes32 reasonCode, // Application specific reason code
        bytes details // Additional details about the error
    );

    error ReasonInvalidZeroAddress();

    error ReasonClearingIsActive();

    error ReasonInsufficientBalance(
        address from, // The address that has insufficient balance
        uint256 fromBalance, // The balance of the address that has insufficient balance
        uint256 value, // The value that was attempted to be transferred
        bytes32 partition // The partition from which the transfer was attempted
    );

    error ReasonInsufficientAllowance(
        address operator, // The address of the operator that attempted the transfer
        address from, // The address that has insufficient allowance
        uint256 fromAllowance, // The allowance of the address that has insufficient allowance
        uint256 value, // The value that was attempted to be transferred
        bytes32 partition // The partition from which the transfer was attempted
    );

    error ReasonMaxSupplyReached(
        uint256 maxSupply // The maximum supply that was reached
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

    error ReasonIssuanceClosed();

    error ReasonInvalidPartition(
        address account, // The address of the account that attempted the operation
        bytes32 partition // The partition that is invalid
    );

    error ReasonNotDefaultPartitionWithSinglePartition(
        bytes32 partition // The partition that is not the default partition
    );

    error ReasonOperatorNotAuthorized(
        bytes32 partition, // The partition for which the operator is not authorized
        address operator, // The address of the operator that is not authorized
        address tokenHolder // The address of the token holder
    );
}
