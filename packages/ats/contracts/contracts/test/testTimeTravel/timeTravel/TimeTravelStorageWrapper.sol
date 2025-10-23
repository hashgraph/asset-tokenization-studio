// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ITimeTravelStorageWrapper
} from '../interfaces/ITimeTravelStorageWrapper.sol';
import {LocalContext} from '../../../layer_0/context/LocalContext.sol';
import {_TIME_TRAVEL_RESOLVER_KEY} from '../constants/resolverKeys.sol';

abstract contract TimeTravelStorageWrapper is
    ITimeTravelStorageWrapper,
    LocalContext
{
    uint256 internal _timestamp;
    uint256 internal _blocknumber;

    constructor() {
        _checkBlockChainid(_blockChainid());
    }

    function _changeSystemTimestamp(uint256 _newSystemTime) internal {
        if (_newSystemTime == 0) {
            revert InvalidTimestamp(_newSystemTime);
        }

        uint256 _oldSystemTime = _timestamp;
        _timestamp = _newSystemTime;

        emit SystemTimestampChanged(_oldSystemTime, _newSystemTime);
    }

    function _resetSystemTimestamp() internal {
        _timestamp = 0;
        emit SystemTimestampReset();
    }

    function _changeSystemBlocknumber(uint256 _newSystemNumber) internal {
        if (_newSystemNumber == 0) {
            revert InvalidBlocknumber(_newSystemNumber);
        }

        uint256 _oldSystemNumber = _blocknumber;
        _blocknumber = _newSystemNumber;

        emit SystemBlocknumberChanged(_oldSystemNumber, _newSystemNumber);
    }

    function _resetSystemBlocknumber() internal {
        _blocknumber = 0;
        emit SystemBlocknumberReset();
    }

    function _blockTimestamp()
        internal
        view
        virtual
        override
        returns (uint256)
    {
        return _timestamp == 0 ? block.timestamp : _timestamp;
    }

    function _blockNumber()
        internal
        view
        virtual
        override
        returns (uint256 blockNumber_)
    {
        return _blocknumber == 0 ? block.number : _blocknumber;
    }

    function _checkBlockChainid(uint256 chainId) internal pure {
        if (chainId != 1337) revert WrongChainId();
    }
}
