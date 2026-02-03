// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ArrayLib } from "../common/libraries/ArrayLib.sol";

abstract contract LocalContext is Context {
    modifier onlyConsistentActivations(address[] calldata _controlLists, bool[] calldata _actives) {
        ArrayLib.checkUniqueValues(_controlLists, _actives);
        _;
    }

    function _isExpired(uint256 _expirationTimestamp) internal view returns (bool) {
        return _blockTimestamp() > _expirationTimestamp;
    }

    function _blockChainid() internal view returns (uint256 chainid_) {
        chainid_ = block.chainid;
    }

    function _blockTimestamp() internal view virtual returns (uint256 blockTimestamp_) {
        blockTimestamp_ = block.timestamp;
    }

    function _blockNumber() internal view virtual returns (uint256 blockNumber_) {
        blockNumber_ = block.number;
    }
}
