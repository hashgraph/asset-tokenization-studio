// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ThirdPartyType } from "../../../layer_0/common/types/ThirdPartyType.sol";
import { IHoldRead } from "./IHoldRead.sol";
import { IHoldTokenHolder } from "./IHoldTokenHolder.sol";
import { IHoldManagement } from "./IHoldManagement.sol";
import { IAccessControl } from "../accessControl/IAccessControl.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { IERC1410 } from "../ERC1400/IERC1410.sol";

enum OperationType {
    Execute,
    Release,
    Reclaim
}

struct HoldIdentifier {
    bytes32 partition;
    address tokenHolder;
    uint256 holdId;
}

struct Hold {
    uint256 amount;
    uint256 expirationTimestamp;
    address escrow;
    address to;
    bytes data;
}

struct ProtectedHold {
    Hold hold;
    uint256 deadline;
    uint256 nonce;
}

struct HoldData {
    uint256 id;
    Hold hold;
    bytes operatorData;
    ThirdPartyType thirdPartyType;
}

struct HoldDataStorage {
    mapping(address => uint256) totalHeldAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalHeldAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => HoldData))) holdsByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) holdIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextHoldIdByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => address))) holdThirdPartyByAccountPartitionAndId;
}

interface IHold is IHoldRead, IHoldManagement, IHoldTokenHolder, IAccessControl, IClearing, IERC1410 {
    error HoldExpirationNotReached();
    error WrongHoldId();
    error InvalidDestinationAddress(address holdDestination, address to);
    error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
    error HoldExpirationReached();
    error IsNotEscrow();
}
