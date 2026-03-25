// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListStorageWrapper } from "./ControlListStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ControlListModifiers
 * @notice Abstract contract providing control list modifiers
 * @dev Provides modifiers for control list validation using _check* pattern
 *      from ControlListStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract ControlListModifiers {
    modifier onlyListedAllowed(address _account) {
        ControlListStorageWrapper._checkControlList(_account);
        _;
    }

    modifier onlySenderListedAllowed() {
        ControlListStorageWrapper._checkControlList(EvmAccessors.getMsgSender());
        _;
    }
}
