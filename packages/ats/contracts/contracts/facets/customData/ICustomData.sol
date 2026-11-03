// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey CustomData
bytes32 constant RESOLVER_KEY_CUSTOM_DATA = 0xfe752225f0f7bb1ac35587b02565558e9fbf467f7354ab27123c0afd1aca9a56;

/**
 * @title ICustomData
 * @author Asset Tokenization Studio Team
 * @notice Interface for storing arbitrary key/value custom data associated with a security token,
 *         where each key maps to an ordered list of byte payloads. Supports atomic seeding of
 *         entries at initialisation time via the `CustomDataEntry` struct.
 * @dev Part of the Diamond facet system. Custom data state is stored at
 *      `STORAGE_LOCATION_CUSTOM_DATA` via `CustomDataStorageWrapper`. Mutations require the
 *      `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused; reads are unrestricted. Each call
 *      to `setCustomData` overwrites the entire array stored under the key — there is no append or
 *      partial update path. Payload encoding is opaque to the contract; producers and consumers
 *      must agree on the schema off-chain.
 */
interface ICustomData {
    /**
     * @notice Represents a single key/value entry used to seed custom data at initialisation time.
     * @param key   The custom data key under which the value is stored.
     * @param value The ordered list of byte payloads to associate with the key.
     */
    struct CustomDataEntry {
        bytes32 key;
        bytes[] value;
    }

    /**
     * @notice Emitted once when the metadata capability is initialised on a token.
     * @dev Fires exclusively from `initializeCustomData`, after all seed entries have been written.
     * @param entries The list of key/value pairs seeded at initialisation time, or an empty array
     *                if no seed data was provided.
     */
    event CustomDataInitialized(CustomDataEntry[] entries);

    /**
     * @notice Emitted whenever the value stored under `key` is set or replaced by `setCustomData`.
     * @dev Fires once per `setCustomData` call. Does NOT fire from `setCustomDataBatch` or
     *      `initializeCustomData`. The emitted `value` is the full replacement array; an empty
     *      array signals the key was cleared.
     * @param key   The custom data key whose value was set.
     * @param value The ordered list of byte payloads now stored under `key`.
     */
    event CustomDataSet(bytes32 indexed key, bytes[] value);

    /**
     * @notice Emitted once when multiple key/value entries are written atomically via
     *         `setCustomDataBatch`.
     * @dev Fires once per `setCustomDataBatch` call, after all entries have been persisted.
     *      Does NOT fire from `initializeCustomData`, which emits `CustomDataInitialized`
     *      instead. Each entry in `entries` follows the same full-overwrite semantics as
     *      `setCustomData`; an empty inner array clears that key.
     * @param entries The list of key/value pairs written in this batch call.
     */
    event CustomDataBatchSet(CustomDataEntry[] entries);

    /**
     * @notice Initialises the custom data capability on the token, optionally seeding key/value
     *         entries atomically at the time of initialisation.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment. Entries are
     *      written via `CustomDataStorageWrapper`, bypassing the role and state guards that protect
     *      the runtime `setCustomData` function — this is intentional during one-time init. If the
     *      same key appears more than once in `_entries`, the last write wins.
     * @param _entries The optional list of key/value pairs to seed on initialisation. Pass an empty
     *                 array to initialise with no data.
     */
    function initializeCustomData(CustomDataEntry[] calldata _entries) external;

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
     * @notice Sets multiple key/value entries in a single call, replacing any previously stored
     *         value under each key.
     * @dev Requires `ROLE_CUSTOM_DATA_MANAGER` and the token to be operational, activated, and
     *      unpaused — identical guards to `setCustomData`. Overwrites the entire array per key;
     *      there is no append semantics. An empty `_entries` array is a silent no-op. Emits a
     *      single `CustomDataBatchSet` event after all entries have been persisted. If a key
     *      repeats within `_entries`, the last write wins. Gas scales with the number of entries
     *      and total payload size.
     * @param _entries The list of key/value pairs to set.
     */
    function setCustomDataBatch(CustomDataEntry[] calldata _entries) external;

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
