// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IMetadata
 * @author Asset Tokenization Studio Team
 * @notice Interface for storing arbitrary key/value metadata associated with a security token,
 *         where each key maps to an ordered list of byte payloads.
 * @dev Part of the Diamond facet system. Metadata state is stored at
 *      `_METADATA_STORAGE_POSITION` via `MetadataStorageWrapper`. Mutations require the
 *      `METADATA_MANAGER_ROLE` and the token to be unpaused; reads are unrestricted. Each call to
 *      `setMetadata` overwrites the entire array stored under the key — there is no append or
 *      partial update path. Payload encoding is opaque to the contract; producers and consumers
 *      must agree on the schema off-chain.
 */
interface IMetadata {
    /**
     * @notice Sets the ordered list of byte payloads associated with `_key`, replacing any
     *         previously stored value.
     * @dev Requires `METADATA_MANAGER_ROLE` and the token to be unpaused. Overwrites the entire
     *      array — there is no append semantics. Empty arrays are permitted and effectively clear
     *      the entry. Callers should be aware of gas costs proportional to the total payload size.
     * @param _key The metadata key under which to store the value.
     * @param _value The ordered list of byte payloads to associate with the key.
     */
    function setMetadata(bytes32 _key, bytes[] calldata _value) external;

    /**
     * @notice Returns the ordered list of byte payloads associated with `_key`.
     * @dev Returns an empty array if the key has never been set or has been cleared. Read-only;
     *      no access control.
     * @param _key The metadata key to query.
     * @return value_ The ordered list of byte payloads stored under `_key`, or an empty array if
     *         unset.
     */
    function getMetadata(bytes32 _key) external view returns (bytes[] memory value_);
}
