// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey DividendSecurityHolders
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS = 0x1478127ed7121d4c1f51d4844183242705cd85c8948b44acb7756ecf98830402;

/**
 * @title IDividendSecurityHolders
 * @author Asset Tokenization Studio Team
 * @notice Read-only interface exposing paginated lookups over the holders eligible for a given
 *         dividend corporate action.
 * @dev Inherits nothing — both methods return primitive types only, so no shared dividend types
 *      are referenced and the EIP-165 interfaceId stays narrow. Aggregated into the off-chain
 *      `IAsset` umbrella alongside the writer interface `IDividend`. The implementation
 *      delegates to `DividendStorageWrapper`, which sources holders from the snapshot bound to
 *      the dividend (or, when no snapshot exists yet, from the current ERC-1410 token holder
 *      registry).
 */
interface IDividendSecurityHolders {
    /**
     * @notice Returns the page of holder addresses eligible for a given dividend.
     * @dev Reverts via the `onlyMatchingActionType` modifier when `dividendId` does not resolve
     *      to a dividend corporate action. Pages past the holder count return an empty array.
     *      Before the record date is reached, the underlying storage layer returns an empty page.
     * @param dividendId One-indexed dividend identifier within the dividend corporate action type.
     * @param pageIndex Zero-based index of the page to retrieve.
     * @param pageLength Maximum number of holders returned in the page.
     * @return holders_ Holder addresses on the requested page, in storage order.
     */
    function getDividendHolders(
        uint256 dividendId,
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Returns the total number of holders eligible for a given dividend.
     * @dev Reverts via the `onlyMatchingActionType` modifier when `dividendId` does not resolve
     *      to a dividend corporate action. Returns zero before the record date is reached.
     * @param dividendId One-indexed dividend identifier within the dividend corporate action type.
     * @return Total number of eligible holders.
     */
    function getTotalDividendHolders(uint256 dividendId) external view returns (uint256);
}
