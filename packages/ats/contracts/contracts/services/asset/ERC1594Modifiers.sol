// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";

/**
 * @title ERC1594Modifiers
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract providing ERC-1594 issuance precondition modifiers.
 * @dev Re-exports checks from `ERC1594StorageWrapper` as modifiers for convenient use in facets.
 */
abstract contract ERC1594Modifiers {
    /**
     * @notice Reverts if token issuance has been disabled.
     * @dev Enforces that `isIssuable()` returns `true`.
     */
    modifier onlyIssuable() {
        ERC1594StorageWrapper.requireIssuable();
        _;
    }
}
