// SPDX-License-Identifier: BSD-3-Clause-Attribution
pragma solidity 0.8.18;

interface IEip1066 {
    error ExtendedError(
        bytes1 statusCode, // Standard defined status code
        bytes32 reasonCode, // Application specific reason code
        bytes details // Additional details about the error
    );
}
