// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IAllowanceTypes
 * @notice Events and errors emitted by the ERC-20 allowance surface.
 */
interface IAllowanceTypes {
    /**
     * @notice Emitted when `owner` authorises `spender` to spend up to `value` tokens on their
     *         behalf, whether via {IAllowance.approve}, {IAllowance.increaseAllowance} or
     *         {IAllowance.decreaseAllowance}.
     * @dev Mirrors the ERC-20 `Approval` event. `value` is the resulting, absolute allowance
     *      after the update — not the delta applied.
     * @param owner Address whose tokens may be spent.
     * @param spender Address authorised to spend on `owner`'s behalf.
     * @param value Allowance of `spender` over `owner`'s tokens after the update.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @notice Reverts when an allowance operation references the zero address as the owner.
     * @dev Defensive guard against mis-wired flows or malformed calldata reaching the
     *      underlying storage wrappers.
     */
    error ZeroOwnerAddress();

    /**
     * @notice Reverts when `spender` attempts to consume more allowance than `from` has
     *         granted.
     * @dev Raised by `transferFrom`-style flows and by {IAllowance.decreaseAllowance} when the
     *      subtracted amount exceeds the current allowance.
     * @param spender Address attempting to spend on behalf of `from`.
     * @param from Address whose allowance is being consumed.
     */
    error InsufficientAllowance(address spender, address from);

    /**
     * @notice Reverts when the zero address is supplied as `spender` in an allowance update.
     */
    error SpenderWithZeroAddress();
}
