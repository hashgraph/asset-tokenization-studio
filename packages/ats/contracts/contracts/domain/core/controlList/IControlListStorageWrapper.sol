// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IControlListStorageWrapper {
    /**
     * @dev Emitted when the account is blocked by the control list:
     *  - whitelist = not in the list
     *  - blakclist = in the list
     *
     */
    error AccountIsBlocked(address account);
}
