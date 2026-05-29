// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey CustomData
bytes32 constant RESOLVER_KEY_CUSTOM_DATA = 0xfe752225f0f7bb1ac35587b02565558e9fbf467f7354ab27123c0afd1aca9a56;

/**
 * @title ICustomData
 * @author Asset Tokenization Studio Team
 * @notice Interface for storing arbitrary key/value custom data associated with a security token,
 *         where each key maps to an ordered list of byte payloads.
 * @dev Part of the Diamond facet system. Custom data state is stored at
 *      `STORAGE_LOCATION_CUSTOM_DATA` via `CustomDataStorageWrapper`. Mutations require the
 *      `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused; reads are unrestricted. Each call
 *      to `setCustomData` overwrites the entire array stored under the key — there is no append or
 *      partial update path. Payload encoding is opaque to the contract; producers and consumers
 *      must agree on the schema off-chain.
 */
interface ICustomData {
    /**
     * @notice Emitted once when the metadata capability is initialised on a token.
     * @dev Fires exclusively from `initializeCustomData`.
     */
    event CustomDataInitialized();

    /**
     * @notice Initialises the custom data capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeCustomData() external;

    /**
     * @notice Sets the ordered list of byte payloads associated with `_key`, replacing any
     *         previously stored value.
     * @dev Requires `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused. Overwrites the entire
     *      array — there is no append semantics. Empty arrays are permitted and effectively clear
     *      the entry. Callers should be aware of gas costs proportional to the total payload size.
     * @param _key   The custom data key under which to store the value.
     * @param _value The ordered list of byte payloads to associate with the key.
     */
    function setCustomData(bytes32 _key, bytes[] calldata _value) external;

    /**
     * @notice Returns the ordered list of byte payloads associated with `_key`.
     * @dev Returns an empty array if the key has never been set or has been cleared. Read-only;
     *      no access control.
     * @param _key The custom data key to query.
     * @return value_ The ordered list of byte payloads stored under `_key`, or an empty array if
     *         unset.
     */
    function getCustomData(bytes32 _key) external view returns (bytes[] memory value_);
}
