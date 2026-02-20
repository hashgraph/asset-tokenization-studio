// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @dev Base interface with events and errors only.
 * Inherit this (instead of IControlList) when a facet needs the error/event ABI
 * without being forced to implement control list functions.
 */
interface IControlListBase {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ════════════════════════════════════════════════════════════════════════════════════

    /**
     * @dev Emitted when an account is added to the controllist
     *
     * @param account The account that was added to the controllist
     * @param operator The caller of the function that emitted the event
     */
    event AddedToControlList(address indexed operator, address indexed account);

    /**
     * @dev Emitted when an account is removed from the controllist
     *
     * @param account The account that was removed from the controllist
     * @param operator The caller of the function that emitted the event
     */
    event RemovedFromControlList(address indexed operator, address indexed account);

    // ════════════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ════════════════════════════════════════════════════════════════════════════════════

    /**
     * @dev Emitted when the account is blocked by the control list:
     *  - whitelist = not in the list
     *  - blacklist = in the list
     */
    error AccountIsBlocked(address account);

    error ListedAccount(address account);
    error UnlistedAccount(address account);
}
