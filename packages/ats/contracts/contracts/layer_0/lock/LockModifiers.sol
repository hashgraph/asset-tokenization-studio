// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410OperatorModifiers } from "../ERC1400/ERC1410/ERC1410OperatorModifiers.sol";

abstract contract LockModifiers is ERC1410OperatorModifiers {
    // ===== Lock Modifiers =====
    modifier onlyWithLockedExpirationTimestamp(bytes32 _partition, address _tokenHolder, uint256 _lockId) virtual;
    modifier onlyWithValidLockId(bytes32 _partition, address _tokenHolder, uint256 _lockId) virtual;
}
