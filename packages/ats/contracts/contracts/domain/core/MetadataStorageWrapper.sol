// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMetadata } from "../../facets/metadata/IMetadata.sol";

/// @custom:hash storage Metadata
bytes32 constant STORAGE_LOCATION_METADATA = 0x88e64aeb880d89a6f66a0868c82854ac54e6006a5ff8da89887d8a89ca5c8700;

/**
 * @notice Diamond storage layout for the metadata domain.
 * @dev Holds an arbitrary key/value store where each `bytes32` key maps to an ordered list of
 *      opaque byte payloads. Payload encoding is the responsibility of off-chain producers and
 *      consumers; the contract treats values as raw bytes.
 * @param metadata Mapping from a metadata key to its ordered list of byte payloads.
 */
/// @custom:storage-location erc7201:security.token.standard.storage.Metadata
struct MetadataDataStorage {
    mapping(bytes32 => bytes[]) metadata;
}

/**
 * @title MetadataStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library providing diamond storage access and the read/write primitives used by the
 *         metadata facet to persist arbitrary key/value entries on a security token.
 * @dev Uses the ERC-2535 diamond storage pattern to isolate state under
 *      `STORAGE_LOCATION_METADATA`, preventing slot collisions with other facets. All entry
 *      points are `internal` so that callers (the `Metadata` facet) inline the logic rather than
 *      paying external-call overhead. Write semantics are full overwrite: each `setMetadata` call
 *      replaces the entire array stored under the key — there is no append or partial update.
 */
library MetadataStorageWrapper {
    /**
     * @notice Replaces the ordered list of byte payloads associated with `_key`.
     * @dev Clears any previously stored array via `delete` and then pushes every element of
     *      `_value` in order, so the resulting state contains exactly `_value`. Passing an empty
     *      array effectively clears the entry. Gas cost scales linearly with `_value.length` and
     *      with the size of each payload because each element is copied from calldata into
     *      storage. Access control and pause checks are enforced by the calling facet, not by
     *      this library.
     * @param _key   The metadata key whose value is being written.
     * @param _value The ordered list of byte payloads to persist under `_key`.
     */
    function setMetadata(bytes32 _key, bytes[] calldata _value) internal {
        bytes[] storage stored = metadataStorage().metadata[_key];
        delete metadataStorage().metadata[_key];
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
     * @param _key The metadata key to query.
     * @return value_ The ordered list of byte payloads stored under `_key`, or an empty array if
     *         unset.
     */
    function getMetadata(bytes32 _key) internal view returns (bytes[] memory value_) {
        value_ = metadataStorage().metadata[_key];
    }

    /**
     * @notice Returns the diamond storage reference for the metadata domain.
     * @dev Resolves the storage struct at the deterministic slot `STORAGE_LOCATION_METADATA`
     *      using inline assembly, following the ERC-2535 diamond storage pattern. Marked `pure`
     *      because slot resolution does not read chain state; the returned reference is what the
     *      caller uses to read or write storage.
     * @return metadata_ Reference to the `MetadataDataStorage` struct at the metadata storage slot.
     */
    function metadataStorage() internal pure returns (MetadataDataStorage storage metadata_) {
        bytes32 position = STORAGE_LOCATION_METADATA;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            metadata_.slot := position
        }
    }
}
