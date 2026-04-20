// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../errors/ICommonErrors.sol";

/**
 * @title ArrayValidation
 * @notice Library for validating array consistency and detecting contradictory values
 * @dev Provides functions to check for duplicate keys with conflicting boolean values
 */
library ArrayValidation {
    /**
     * @notice Validates that no duplicates exist with contradictory boolean values
     * @dev Reverts with ContradictoryValuesInArray if same address has different bool values
     * @param _addresses Array of addresses to check for duplicates
     * @param _bools Array of.boolean values to compare for duplicates
     */
    function checkUniqueValues(address[] memory _addresses, bool[] memory _bools) internal pure {
        uint256 length = _addresses.length;
        uint256 innerIndex;
        for (uint256 index; index < length; ) {
            unchecked {
                innerIndex = index + 1;
            }
            for (; innerIndex < length; ) {
                if (_addresses[index] == _addresses[innerIndex] && _bools[index] != _bools[innerIndex])
                    revert ICommonErrors.ContradictoryValuesInArray(index, innerIndex);
                unchecked {
                    ++innerIndex;
                }
            }
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Validates that no duplicates exist with contradictory boolean values
     * @dev Reverts with ContradictoryValuesInArray if same bytes32 has different bool values
     * @param _bytes32s Array of bytes32 values to check for duplicates
     * @param _bools Array of boolean values to compare for duplicates
     */
    function checkUniqueValues(bytes32[] memory _bytes32s, bool[] memory _bools) internal pure {
        uint256 length = _bytes32s.length;
        uint256 innerIndex;
        for (uint256 index; index < length; ) {
            unchecked {
                innerIndex = index + 1;
            }
            for (; innerIndex < length; ) {
                if (_bytes32s[index] == _bytes32s[innerIndex] && _bools[index] != _bools[innerIndex])
                    revert ICommonErrors.ContradictoryValuesInArray(index, innerIndex);
                unchecked {
                    ++innerIndex;
                }
            }
            unchecked {
                ++index;
            }
        }
    }
}
