// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ThirdPartyType } from "../../../layer_0/common/types/ThirdPartyType.sol";

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

    struct ClearingTransferData {
        uint256 amount;
        uint256 expirationTimestamp;
        address destination;
        bytes data;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    struct ClearingRedeemData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    struct ClearingHoldCreationData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        address holdEscrow;
        uint256 holdExpirationTimestamp;
        address holdTo;
        bytes holdData;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    // solhint-disable max-line-length
    struct ClearingDataStorage {
        bool initialized;
        bool activated;
        mapping(address => uint256) totalClearedAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) totalClearedAmountByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(ClearingOperationType => EnumerableSet.UintSet))) clearingIdsByAccountAndPartitionAndTypes;
        mapping(address => mapping(bytes32 => mapping(ClearingOperationType => uint256))) nextClearingIdByAccountPartitionAndType;
        mapping(address => mapping(bytes32 => mapping(uint256 => ClearingTransferData))) clearingTransferByAccountPartitionAndId;
        mapping(address => mapping(bytes32 => mapping(uint256 => ClearingRedeemData))) clearingRedeemByAccountPartitionAndId;
        mapping(address => mapping(bytes32 => mapping(uint256 => ClearingHoldCreationData))) clearingHoldCreationByAccountPartitionAndId;
        mapping(address => mapping(bytes32 => mapping(ClearingOperationType => mapping(uint256 => address)))) clearingThirdPartyByAccountPartitionTypeAndId;
    }
    // solhint-enable max-line-length

    error WrongClearingId();
    error ClearingIsDisabled();
    error ClearingIsActivated();
    error ExpirationDateReached();
    error ExpirationDateNotReached();
}
