// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IERC1410StorageWrapper} from './IERC1410StorageWrapper.sol';
import {IERC1410Read} from './IERC1410Read.sol';
import {IERC1410TokenHolder} from './IERC1410TokenHolder.sol';
import {IERC1410Management} from './IERC1410Management.sol';
import {IERC1410Issuer} from './IERC1410Issuer.sol';

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
    IERC1410TokenHolder,
    IERC1410Management,
    IERC1410Issuer
{
    // This interface combines all ERC1410 facets for external access
}
