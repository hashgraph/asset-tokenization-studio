// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PROTECTED_PARTITIONS_STORAGE_POSITION } from "../constants/storagePositions.sol";

/// @dev Protected partitions storage
struct ProtectedPartitionsDataStorage {
    bool initialized;
    bool arePartitionsProtected;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    // solhint-disable-next-line var-name-mixedcase
    mapping(address => uint256) DEPRECATED_nounces;
}

/// @dev Access protected partitions storage
function protectedPartitionsStorage() pure returns (ProtectedPartitionsDataStorage storage protectedPartitions_) {
    bytes32 pos = _PROTECTED_PARTITIONS_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        protectedPartitions_.slot := pos
    }
}
