// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.18;

import {IERC1410StorageWrapper} from './IERC1410StorageWrapper.sol';
import {IERC1410Read} from './IERC1410Read.sol';
import {IERC1410Transfer} from './IERC1410Transfer.sol';
import {IERC1410Management} from './IERC1410Management.sol';
import {IPause} from '../pause/IPause.sol';
import {ISnapshots} from '../snapshots/ISnapshots.sol';

struct BasicTransferInfo {
    address to;
    uint256 value;
}

struct OperatorTransferData {
    bytes32 partition;
    address from;
    address to;
    uint256 value;
    bytes data;
    bytes operatorData;
}

struct IssueData {
    bytes32 partition;
    address tokenHolder;
    uint256 value;
    bytes data;
}

// solhint-disable no-empty-blocks
/**
 * @title IERC1410
 * @dev Unified interface for ERC1410 functionality combining all three facets.
 * This interface provides external access to all ERC1410 functions through the Diamond pattern,
 * enabling interaction with all 1410 functions from external calls, tests, and SDK.
 * This interface is NOT meant to be inherited by any contract - it's only for external interaction.
 */
interface IERC1410 is
    IERC1410StorageWrapper,
    IERC1410Read,
    IERC1410Transfer,
    IERC1410Management,
    IPause,
    ISnapshots
{
    // This interface combines all ERC1410 facets for external access
}
