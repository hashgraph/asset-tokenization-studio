// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library LibCommon {
    using EnumerableSet for EnumerableSet.AddressSet;

    function getFromSet(
        EnumerableSet.AddressSet storage _set,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory items_) {
        uint256 listCount = _set.length();
        (uint256 start, uint256 end) = getStartAndEnd(_pageIndex, _pageLength);

        items_ = new address[](getSize(start, end, listCount));

        uint256 length = items_.length;
        uint256 position = start;
        for (uint256 index; index < length; ) {
            items_[index] = _set.at(position);
            unchecked {
                ++position;
                ++index;
            }
        }
    }

    function getSize(uint256 _start, uint256 _end, uint256 _listCount) internal pure returns (uint256) {
        if (_start > _end || _start > _listCount) {
            return 0;
        }

        unchecked {
            return (_end > _listCount ? _listCount : _end) - _start;
        }
    }

    function getStartAndEnd(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal pure returns (uint256 start_, uint256 end_) {
        unchecked {
            start_ = _pageIndex * _pageLength;
            end_ = start_ + _pageLength;
        }
    }
}
