// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../storage/ERC1410Storage.sol";
import "./LibAccess.sol";

/**
 * NEW ARCHITECTURE - LibPartition
 *
 * ONLY partition validation logic.
 * Single responsibility. Easy to find. Easy to audit.
 */
library LibPartition {
    error ProtectedPartition(bytes32 partition);
    error InvalidPartition(bytes32 partition);

    function requireUnprotectedOrWildcard() internal view {
        ERC1410Storage storage s = erc1410Storage();
        if (s.protectedPartitions && !LibAccess.hasRole(OPERATOR_ROLE, msg.sender)) {
            revert ProtectedPartition(DEFAULT_PARTITION);
        }
    }

    function requireValidPartition(bytes32 partition) internal pure {
        if (partition == bytes32(0)) revert InvalidPartition(partition);
    }

    function setProtected(bytes32 partition, bool protected) internal {
        erc1410Storage().isProtected[partition] = protected;
    }

    function isProtected(bytes32 partition) internal view returns (bool) {
        return erc1410Storage().isProtected[partition];
    }
}
