// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title EnumerableSetBytes4
 * @author Asset Tokenization Studio Team
 * @notice Library for managing sets of `bytes4` values with O(1) add, remove and contains
 *         operations and O(n) enumeration, mirroring OpenZeppelin's EnumerableSet pattern.
 */
library EnumerableSetBytes4 {
    /// @notice Internal layout backing a set: the value array plus a 1-based position index.
    struct Set {
        // Storage of set values
        bytes4[] _values;
        // Position of the value in the `values` array, plus 1 because index 0
        // means a value is not in the set.
        mapping(bytes4 => uint256) _indexes;
    }

    /// @notice Public bytes4 set type wrapping the internal `Set` layout.
    struct Bytes4Set {
        Set _inner;
    }

    /**
     * @notice Adds a value to the set. O(1).
     * @param set The Bytes4Set to modify.
     * @param value The bytes4 value to add.
     * @return True if the value was not already present and was added; false otherwise.
     */
    function add(Bytes4Set storage set, bytes4 value) internal returns (bool) {
        return _add(set._inner, value);
    }

    /**
     * @notice Removes a value from the set. O(1).
     * @param set The Bytes4Set to modify.
     * @param value The bytes4 value to remove.
     * @return True if the value was present and has been removed; false otherwise.
     */
    function remove(Bytes4Set storage set, bytes4 value) internal returns (bool) {
        return _remove(set._inner, value);
    }

    /**
     * @notice Returns true if the value is present in the set. O(1).
     * @param set The Bytes4Set to query.
     * @param value The bytes4 value to look up.
     * @return True if `value` is a member of `set`; false otherwise.
     */
    function contains(Bytes4Set storage set, bytes4 value) internal view returns (bool) {
        return _contains(set._inner, value);
    }

    /**
     * @notice Returns the number of values in the set. O(1).
     * @param set The Bytes4Set to query.
     * @return The number of elements currently stored in `set`.
     */
    function length(Bytes4Set storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @notice Returns the value stored at position `index` in the set. O(1).
     * @dev No ordering guarantees: a value's position may change as values are added or removed.
     *      `index` must be strictly less than `length`.
     * @param set The Bytes4Set to query.
     * @param index Zero-based position within the underlying values array.
     * @return The bytes4 value at `index`.
     */
    function at(Bytes4Set storage set, uint256 index) internal view returns (bytes4) {
        return _at(set._inner, index);
    }

    /**
     * @notice Adds a value to the underlying set storage. O(1).
     * @param set The raw Set to modify.
     * @param value The bytes4 value to add.
     * @return True if the value was absent and has been inserted; false if already present.
     */
    function _add(Set storage set, bytes4 value) private returns (bool) {
        if (!_contains(set, value)) {
            set._values.push(value);
            // The value is stored at length-1, but we add 1 to all indexes
            // and use 0 as a sentinel value
            set._indexes[value] = set._values.length;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @notice Removes a value from the underlying set storage using swap-and-pop. O(1).
     * @param set The raw Set to modify.
     * @param value The bytes4 value to remove.
     * @return True if the value was present and has been deleted; false otherwise.
     */
    function _remove(Set storage set, bytes4 value) private returns (bool) {
        // We read and store the value's index to prevent multiple reads from the same storage slot
        uint256 valueIndex = set._indexes[value];

        if (valueIndex != 0) {
            // Equivalent to contains(set, value)
            // To delete an element from the _values array in O(1), we swap the element to delete with the last one in
            // the array, and then remove the last element (sometimes called as 'swap and pop').
            // This modifies the order of the array, as noted in {at}.

            uint256 toDeleteIndex = valueIndex - 1;
            uint256 lastIndex = set._values.length - 1;

            if (lastIndex != toDeleteIndex) {
                bytes4 lastValue = set._values[lastIndex];

                // Move the last value to the index where the value to delete is
                set._values[toDeleteIndex] = lastValue;
                // Update the index for the moved value
                set._indexes[lastValue] = valueIndex; // Replace lastValue's index to valueIndex
            }

            // Delete the slot where the moved value was stored
            set._values.pop();

            // Delete the index for the deleted slot
            delete set._indexes[value];

            return true;
        } else {
            return false;
        }
    }

    /**
     * @notice Returns true if the value is present in the underlying set storage. O(1).
     * @param set The raw Set to query.
     * @param value The bytes4 value to look up.
     * @return True if `value` is a member of `set`; false otherwise.
     */
    function _contains(Set storage set, bytes4 value) private view returns (bool) {
        return set._indexes[value] != 0;
    }

    /**
     * @notice Returns the number of values in the underlying set storage. O(1).
     * @param set The raw Set to query.
     * @return The number of elements currently stored in `set`.
     */
    function _length(Set storage set) private view returns (uint256) {
        return set._values.length;
    }

    /**
     * @notice Returns the value at `index` in the underlying set storage. O(1).
     * @dev No ordering guarantees: a value's position may change as values are added or removed.
     *      `index` must be strictly less than `length`.
     * @param set The raw Set to query.
     * @param index Zero-based position within the underlying values array.
     * @return The bytes4 value at `index`.
     */
    function _at(Set storage set, uint256 index) private view returns (bytes4) {
        return set._values[index];
    }
}
