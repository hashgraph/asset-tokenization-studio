// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITimeTravelStorageWrapper } from "../interfaces/ITimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../infrastructure/lib/LocalContext.sol";

abstract contract TimeTravelStorageWrapper is ITimeTravelStorageWrapper, LocalContext {
    uint256 internal _timestamp;
    uint256 internal _blocknumber;

    /// @dev Well-known storage slot shared with LibERC20Votes for block number override.
    ///      Must match the constant in LibERC20Votes.
    bytes32 private constant _BLOCK_NUMBER_OVERRIDE_SLOT = keccak256("io.builders.ats.testing.blocknumber.override");

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

        // Also write to the well-known slot for library-based code (LibERC20Votes)
        bytes32 slot = _BLOCK_NUMBER_OVERRIDE_SLOT;
        assembly {
            sstore(slot, _newSystemNumber)
        }

        emit SystemBlocknumberChanged(_oldSystemNumber, _newSystemNumber);
    }

    function _resetSystemBlocknumber() internal {
        _blocknumber = 0;

        // Also reset the well-known slot for library-based code
        bytes32 slot = _BLOCK_NUMBER_OVERRIDE_SLOT;
        assembly {
            sstore(slot, 0)
        }

        emit SystemBlocknumberReset();
    }

    function _blockTimestamp() internal view virtual override returns (uint256) {
        return _timestamp == 0 ? super._blockTimestamp() : _timestamp;
    }

    function _blockNumber() internal view virtual override returns (uint256 blockNumber_) {
        return _blocknumber == 0 ? super._blockNumber() : _blocknumber;
    }

    function _checkBlockChainid(uint256 chainId) internal pure {
        if (chainId != 1337) revert WrongChainId();
    }
}
