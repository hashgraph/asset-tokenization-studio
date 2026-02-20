// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibTimeTravel } from "./LibTimeTravel.sol";
import { ITimeTravel } from "./ITimeTravel.sol";

abstract contract TimeTravel is ITimeTravel {
    function changeSystemTimestamp(uint256 newTimestamp) external override {
        if (newTimestamp == 0) {
            revert InvalidTimestamp(newTimestamp);
        }
        uint256 oldTimestamp = LibTimeTravel.getTimestampOverride();
        LibTimeTravel.setTimestampOverride(newTimestamp);
        emit SystemTimestampChanged(oldTimestamp, newTimestamp);
    }

    function resetSystemTimestamp() external override {
        LibTimeTravel.setTimestampOverride(0);
        emit SystemTimestampReset();
    }

    function changeSystemBlocknumber(uint256 _newSystemBlocknumber) external override {
        if (_newSystemBlocknumber == 0) {
            revert InvalidBlocknumber(_newSystemBlocknumber);
        }
        uint256 oldBlocknumber = LibTimeTravel.getBlockNumberOverride();
        LibTimeTravel.setBlockNumberOverride(_newSystemBlocknumber);
        emit SystemBlocknumberChanged(oldBlocknumber, _newSystemBlocknumber);
    }

    function resetSystemBlocknumber() external override {
        LibTimeTravel.setBlockNumberOverride(0);
        emit SystemBlocknumberReset();
    }

    function blockTimestamp() external view override returns (uint256) {
        return LibTimeTravel.getBlockTimestamp();
    }

    /*
     * @dev Check the chainId of the current block (only for testing)
     * @param chainId The chainId to check
     */
    function checkBlockChainid(uint256 chainId) external pure {
        if (chainId != 1337) revert WrongChainId();
    }
}
