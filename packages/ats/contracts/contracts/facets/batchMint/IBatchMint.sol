// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IBatchMint
 * @notice Interface for batch minting tokens to multiple addresses in a single transaction.
 * @dev Exposes the `batchMint` operation used by the `BatchMintFacet` Diamond facet.
 *      Callers must hold the issuer or agent role; each recipient must pass identity and
 *      compliance checks, and the cumulative issuance must not exceed the configured
 *      maximum supply cap.
 * @author Hashgraph Asset Tokenization
 */
interface IBatchMint {
    /**
     * @notice Batch mint tokens to multiple addresses.
     * @dev Iterates over `_toList` and `_amounts` in two passes: first validates identity,
     *      compliance, and cap constraints for every recipient, then issues tokens to each
     *      address via `ERC1594StorageWrapper.issue`.
     *      Reverts if the token is paused, if the arrays differ in length, if the caller
     *      lacks the issuer or agent role, if a recipient fails identity or compliance
     *      checks, or if any single mint would exceed the maximum supply.
     *      Restricted to non-multi-partition tokens.
     * @param _toList  Ordered list of recipient addresses.
     * @param _amounts Ordered list of token amounts corresponding to each recipient.
     */
    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external;
}
