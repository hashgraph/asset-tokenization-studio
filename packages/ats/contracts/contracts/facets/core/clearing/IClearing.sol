// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IClearing {
    enum ClearingOperationType {
        Transfer,
        Redeem,
        HoldCreation
    }

    struct ClearingOperationBasicInfo {
        uint256 expirationTimestamp;
        uint256 amount;
        address destination;
    }

    struct ClearingOperation {
        bytes32 partition;
        uint256 expirationTimestamp;
        bytes data;
    }

    struct ClearingOperationFrom {
        ClearingOperation clearingOperation;
        address from;
        bytes operatorData;
    }

    struct ProtectedClearingOperation {
        ClearingOperation clearingOperation;
        address from;
        uint256 deadline;
        uint256 nonce;
    }

    struct ClearingOperationIdentifier {
        ClearingOperationType clearingOperationType;
        bytes32 partition;
        address tokenHolder;
        uint256 clearingId;
    }

    error WrongClearingId();
    error WrongExpirationTimestamp();
    error ClearingIsDisabled();
    error ClearingIsActivated();
    error ExpirationDateReached();
    error ExpirationDateNotReached();
}
