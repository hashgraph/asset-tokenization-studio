// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.18;

import {IERC1410Read} from './IERC1410Read.sol';
import {IERC1410Transfer} from './IERC1410Transfer.sol';
import {IERC1410Management} from './IERC1410Management.sol';

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
interface IERC1410 is IERC1410Read, IERC1410Transfer, IERC1410Management {
    // This interface combines all ERC1410 facets for external access
    // No additional function declarations needed as they are inherited from the facet interfaces
    // This interface inherits all functions from the three facet interfaces:
    // From IERC1410Read (11 functions):
    // - Balance and supply functions: balanceOf, balanceOfAt, balanceOfByPartition, totalSupply,
    //   totalSupplyByPartition, partitionsOf
    // - Configuration functions: isMultiPartition
    // - Operator functions: isOperator, isOperatorForPartition
    // - Validation functions: canTransferByPartition, canRedeemByPartition
    // From IERC1410Transfer (8 functions):
    // - Basic transfer: transferByPartition
    // - Redemption and issuance: redeemByPartition, issueByPartition
    // - Operator management: authorizeOperator, revokeOperator, authorizeOperatorByPartition, revokeOperatorByPartition
    // - Sync function: triggerAndSyncAll
    // From IERC1410Management (7 functions):
    // - Initialization: initializeERC1410
    // - Controller functions: controllerTransferByPartition, controllerRedeemByPartition
    // - Operator functions: operatorTransferByPartition, operatorRedeemByPartition
    // - Protected functions: protectedTransferFromByPartition, protectedRedeemFromByPartition
    // Total: 26 functions accessible through Diamond pattern
}
