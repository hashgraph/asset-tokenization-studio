// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

library ArrayLib {
    error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex);

    function getSlotForDynamicArrayItem(
        uint256 _dynamicArraySlot,
        uint256 _itemIndex,
        uint256 _itemsSize
    ) internal pure returns (uint256) {
        uint256 dynamicArrayBaseSlot = uint256(
            keccak256(abi.encode(_dynamicArraySlot))
        );

        return dynamicArrayBaseSlot + _itemIndex * _itemsSize;
    }

    function checkUniqueValues(
        address[] memory _addresses,
        bool[] memory _bools
    ) internal pure {
        uint256 length = _addresses.length;
        uint256 innerIndex;
        for (uint256 index; index < length; ) {
            unchecked {
                innerIndex = index + 1;
            }
            for (; innerIndex < length; ) {
                if (
                    _addresses[index] == _addresses[innerIndex] &&
                    _bools[index] != _bools[innerIndex]
                ) revert ContradictoryValuesInArray(index, innerIndex);
                unchecked {
                    ++innerIndex;
                }
            }
            unchecked {
                ++index;
            }
        }
    }

    function checkUniqueValues(
        bytes32[] memory _bytes32s,
        bool[] memory _bools
    ) internal pure {
        uint256 length = _bytes32s.length;
        uint256 innerIndex;
        for (uint256 index; index < length; ) {
            unchecked {
                innerIndex = index + 1;
            }
            for (; innerIndex < length; ) {
                if (
                    _bytes32s[index] == _bytes32s[innerIndex] &&
                    _bools[index] != _bools[innerIndex]
                ) revert ContradictoryValuesInArray(index, innerIndex);
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
