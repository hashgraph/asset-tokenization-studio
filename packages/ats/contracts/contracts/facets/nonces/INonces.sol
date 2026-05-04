// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title INonces
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying per-account nonces used in off-chain signature schemes such as
 *         EIP-2612 permit.
 * @dev Derived from OpenZeppelin's `Nonces` interface. Each nonce is a monotonically increasing
 *      counter; it is incremented internally after a valid signed operation (e.g. permit) to
 *      invalidate replay of the same signature.
 */
interface INonces {
    /**
     * @notice Returns the current nonce for `owner`.
     * @param owner Address whose nonce is queried.
     * @return Current nonce value for `owner`.
     */
    function nonces(address owner) external view returns (uint256);
}
