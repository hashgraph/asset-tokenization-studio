// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IControlListStorageWrapper {
    /**
     * @dev Emitted when the account is blocked by the control list:
     *  - whitelist = not in the list
     *  - blakclist = in the list
     *
     */
    error AccountIsBlocked(address account);
}
