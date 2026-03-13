// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

abstract contract TimestampProvider {
    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _getBlockNumber() internal view virtual returns (uint256) {
        return block.number;
    }
}
