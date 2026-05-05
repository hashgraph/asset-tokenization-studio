// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Read } from "./IERC3643Read.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";

abstract contract ERC3643Read is IERC3643Read {
    function isAddressRecovered(address _wallet) external view returns (bool) {
        return ERC3643StorageWrapper.isRecovered(_wallet);
    }
}
