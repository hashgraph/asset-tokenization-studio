// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDividendSecurityHolders } from "./IDividendSecurityHolders.sol";
import { CORPORATE_ACTION_TYPE_DIVIDEND } from "../../constants/dispatchTypes.sol";
import { DividendStorageWrapper } from "../../domain/asset/dividend/DividendStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title DividendSecurityHolders
 * @author Asset Tokenization Studio Team
 * @notice Abstract base providing the read-only holder lookups exposed by
 *         `DividendSecurityHoldersFacet`.
 * @dev Thin forwarder over `DividendStorageWrapper`; holds no storage of its own. Each external
 *      method is gated by `onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)`,
 *      ensuring the caller's `dividendId` actually resolves to a dividend corporate action before
 *      any storage read. The library handles snapshot vs. live-registry sourcing internally.
 */
abstract contract DividendSecurityHolders is IDividendSecurityHolders, Modifiers {
    /// @inheritdoc IDividendSecurityHolders
    /// @dev Reverts through `onlyMatchingActionType` if `dividendId` does not match the dividend
    ///      corporate action type at index `dividendId - 1`.
    function getDividendHolders(
        uint256 dividendId,
        uint256 pageIndex,
        uint256 pageLength
    )
        external
        view
        override
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)
        returns (address[] memory holders_)
    {
        return DividendStorageWrapper.getDividendHolders(dividendId, pageIndex, pageLength);
    }

    /// @inheritdoc IDividendSecurityHolders
    /// @dev Reverts through `onlyMatchingActionType` if `dividendId` does not match the dividend
    ///      corporate action type at index `dividendId - 1`.
    function getTotalDividendHolders(
        uint256 dividendId
    ) external view override onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1) returns (uint256) {
        return DividendStorageWrapper.getTotalDividendHolders(dividendId);
    }
}
