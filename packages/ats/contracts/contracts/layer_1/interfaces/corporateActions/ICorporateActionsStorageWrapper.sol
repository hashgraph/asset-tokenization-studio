// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

struct ActionData {
    bytes32 actionType;
    bytes data;
    bytes[] results;
    uint256 actionIndexByType;
}

struct CorporateActionDataStorage {
    EnumerableSet.Bytes32Set actions;
    mapping(bytes32 => ActionData) actionsData;
    mapping(bytes32 => bytes32[]) actionsByType;
}

interface ICorporateActionsStorageWrapper {
    error WrongIndexForAction(uint256 index, bytes32 actionType);
    error WrongDates(uint256 firstDate, uint256 secondDate);
}
