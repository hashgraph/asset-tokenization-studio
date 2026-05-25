// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management } from "./IERC1410Management.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";

abstract contract ERC1410Management is IERC1410Management, Modifiers {
    function initializeERC1410(bool _multiPartition) external override onlyNotERC1410Initialized {
        ERC1410StorageWrapper.initializeERC1410(_multiPartition);
    }
}
