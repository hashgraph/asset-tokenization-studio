// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSetBytes4 } from "../../infrastructure/utils/EnumerableSetBytes4.sol";

contract EnumerableSetBytes4Mock {
    EnumerableSetBytes4.Bytes4Set private _set;

    function add(bytes4 value) external returns (bool) {
        return EnumerableSetBytes4.add(_set, value);
    }

    function remove(bytes4 value) external returns (bool) {
        return EnumerableSetBytes4.remove(_set, value);
    }

    function contains(bytes4 value) external view returns (bool) {
        return EnumerableSetBytes4.contains(_set, value);
    }

    function length() external view returns (uint256) {
        return EnumerableSetBytes4.length(_set);
    }

    function at(uint256 index) external view returns (bytes4) {
        return EnumerableSetBytes4.at(_set, index);
    }
}
