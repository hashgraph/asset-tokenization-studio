// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash storage CustomData
bytes32 constant STORAGE_LOCATION_CUSTOM_DATA = 0x92acc34fbd05df4f7a3d758b1a1755231ecd82ae24df88ea7a638c1b704de700;

/**
 * @notice Diamond storage layout for the custom data domain.
 * @dev Holds an arbitrary key/value store where each `bytes32` key maps to an ordered list of
 *      opaque byte payloads. Payload encoding is the responsibility of off-chain producers and
 *      consumers; the contract treats values as raw bytes. New fields must be appended below the
 *      APPEND-ONLY marker to preserve upgrade safety.
 * @custom:storage-location erc7201:security.token.standard.storage.CustomData
 */
struct CustomDataDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(bytes32 => bytes[]) customData;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title CustomDataStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library providing diamond storage access and the read/write primitives used by the
 *         custom data facet to persist arbitrary key/value entries on a security token.
 * @dev Uses the ERC-2535 diamond storage pattern to isolate state under
 *      `STORAGE_LOCATION_CUSTOM_DATA`, preventing slot collisions with other facets. All entry
 *      points are `internal` so that callers (the `CustomData` facet) inline the logic rather than
 *      paying external-call overhead. Write semantics are full overwrite: each `setCustomData` call
 *      replaces the entire array stored under the key — there is no append or partial update.
 */
library CustomDataStorageWrapper {
    /**
     * @notice Replaces the ordered list of byte payloads associated with `_key`.
     * @dev Clears any previously stored array via `delete` and then pushes every element of
     *      `_value` in order, so the resulting state contains exactly `_value`. Passing an empty
     *      array effectively clears the entry. Gas cost scales linearly with `_value.length` and
     *      with the size of each payload because each element is copied from calldata into
     *      storage. Access control and pause checks are enforced by the calling facet, not by
     *      this library.
     * @param _key   The custom data key whose value is being written.
     * @param _value The ordered list of byte payloads to persist under `_key`.
     */
    function setCustomData(bytes32 _key, bytes[] calldata _value) internal {
        bytes[] storage stored = customDataStorage().customData[_key];
        delete customDataStorage().customData[_key];
        uint256 length = _value.length;
        for (uint256 i; i < length; ) {
            stored.push(_value[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns the ordered list of byte payloads associated with `_key`.
     * @dev Returns an empty array when the key has never been written or has been cleared. The
     *      returned array is a memory copy of the stored data; mutating it does not affect
     *      storage.
     * @param _key The custom data key to query.
     * @return value_ The ordered list of byte payloads stored under `_key`, or an empty array if
     *         unset.
     */
    function getCustomData(bytes32 _key) internal view returns (bytes[] memory value_) {
        value_ = customDataStorage().customData[_key];
    }

    /**
     * @notice Returns the diamond storage reference for the custom data domain.
     * @dev Resolves the storage struct at the deterministic slot `STORAGE_LOCATION_CUSTOM_DATA`
     *      using inline assembly, following the ERC-2535 diamond storage pattern. Marked `pure`
     *      because slot resolution does not read chain state; the returned reference is what the
     *      caller uses to read or write storage.
     * @return customData_ Reference to the `CustomDataDataStorage` struct at the custom data
     *         storage slot.
     */
    function customDataStorage() private pure returns (CustomDataDataStorage storage customData_) {
        bytes32 position = STORAGE_LOCATION_CUSTOM_DATA;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            customData_.slot := position
        }
    }
}
