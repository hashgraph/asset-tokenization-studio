// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAdjusted } from "./ICoreAdjusted.sol";
import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";

abstract contract CoreAdjusted is ICoreAdjusted {
    function decimalsAt(uint256 _timestamp) external view override returns (uint8) {
        return ERC20StorageWrapper.decimalsAdjustedAt(_timestamp);
    }
}
