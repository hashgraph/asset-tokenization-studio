// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IERC3643Operations } from "./IERC3643Operations.sol";
import { IERC3643Management } from "./IERC3643Management.sol";
import { IERC3643Read } from "./IERC3643Read.sol";
import { IERC3643Batch } from "./IERC3643Batch.sol";

interface IERC3643 is IERC3643Operations, IERC3643Management, IERC3643Read, IERC3643Batch {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event TransferByPartition(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data
    );

    event ComplianceAdded(address indexed compliance);

    error InsufficientFrozenBalance(
        address user,
        uint256 requestedUnfreeze,
        uint256 availableFrozen,
        bytes32 partition
    );
}
