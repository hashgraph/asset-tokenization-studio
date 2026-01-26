// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

import { LocalContext } from "../../../common/LocalContext.sol";
import { ITimeTravel } from "../interfaces/ITimeTravel.sol";

abstract contract TimeTravel is ITimeTravel, LocalContext {
    uint256 internal _timestamp;

    function changeSystemTimestamp(uint256 _newSystemTime) external {
        if (_newSystemTime == 0) {
            revert InvalidTimestamp(_newSystemTime);
        }

        emit SystemTimestampChanged(_timestamp, _newSystemTime);

        _timestamp = _newSystemTime;
    }

    function resetSystemTimestamp() external {
        _timestamp = 0;
        emit SystemTimestampReset();
    }

    function _blockTimestamp() internal view virtual override returns (uint256) {
        return _timestamp == 0 ? block.timestamp : _timestamp;
    }
}
