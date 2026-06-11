// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash storage Nonce
bytes32 constant STORAGE_LOCATION_NONCE = 0x9752efd73e12c56ed1d4aebb7f98c3d8260f0d65c130c4c2ebd9d9c92d79a600;

/**
 * @notice Storage layout backing per-account nonces used to authorise signed off-chain operations.
 * @dev Anchored at the ERC-7201 namespace `security.token.standard.storage.Nonce`. New fields
 *      must be appended below the APPEND-ONLY marker to preserve upgrade safety.
 * @custom:storage-location erc7201:security.token.standard.storage.Nonce
 */
struct NonceDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => uint256) nonces;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title NonceStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Internal library exposing increment and read helpers for the per-account nonce store.
 */
library NonceStorageWrapper {
    /**
     * @notice Increments the nonce for `_account` by one.
     * @dev Wrapped in `unchecked` because monotonic, single-step increments cannot realistically
     *      overflow `uint256` for any account.
     * @param _account The address whose nonce is incremented.
     */
    function setNonceFor(address _account) internal {
        unchecked {
            ++nonceStorage().nonces[_account];
        }
    }

    /**
     * @notice Returns the current nonce for `_account`.
     * @param _account The address whose nonce is read.
     * @return The current nonce value, zero if never set.
     */
    function getNonceFor(address _account) internal view returns (uint256) {
        return nonceStorage().nonces[_account];
    }

    /**
     * @notice Returns the storage pointer for the Nonce namespace.
     * @dev Resolves the ERC-7201 slot via inline assembly to obtain a struct reference at
     *      `STORAGE_LOCATION_NONCE`.
     * @return nonces_ Storage reference to the `NonceDataStorage` struct.
     */
    function nonceStorage() private pure returns (NonceDataStorage storage nonces_) {
        bytes32 position = STORAGE_LOCATION_NONCE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nonces_.slot := position
        }
    }
}
