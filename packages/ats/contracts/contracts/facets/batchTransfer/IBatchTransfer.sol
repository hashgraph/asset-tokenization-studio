// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IBatchTransfer
 * @notice Interface for batch transferring tokens to multiple addresses in a single transaction.
 * @dev Intended for use by token holders operating on ERC3643-compliant tokens under single
 *      partition mode. Exposes the `batchTransfer` selector registered in the Diamond proxy
 *      under `_BATCH_TRANSFER_RESOLVER_KEY`.
 * @author Asset Tokenization Studio Team
 */
interface IBatchTransfer {
    /**
     * @notice Transfers tokens from the caller to multiple addresses in a single transaction.
     * @dev Token must be unpaused, not in multi-partition mode, clearing disabled, and the
     *      caller plus every recipient must satisfy identity and compliance checks. Delegates
     *      each transfer to `TokenCoreOps.transfer`.
     * @param _toList Recipient addresses.
     * @param _amounts Corresponding token amounts to transfer. Must be the same length as `_toList`.
     */
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;
}
