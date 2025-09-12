// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    SnapshotsStorageWrapper1
} from '../snapshots/SnapshotsStorageWrapper1.sol';

abstract contract ScheduledTasksCommon is SnapshotsStorageWrapper1 {
    error WrongTimestamp(uint256 timeStamp);
    error NotAutocalling();

    modifier onlyValidTimestamp(uint256 _timestamp) {
        _checkTimestamp(_timestamp);
        _;
    }

    modifier onlyAutoCalling(bool _autoCalling) {
        _checkAutoCalling(_autoCalling);
        _;
    }

    function _checkTimestamp(uint256 _timestamp) private view {
        if (_timestamp <= _blockTimestamp()) revert WrongTimestamp(_timestamp);
    }

    function _checkAutoCalling(bool _autoCalling) private pure {
        if (!_autoCalling) revert NotAutocalling();
    }
}
