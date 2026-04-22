// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAllowanceTypes } from "./IAllowanceTypes.sol";

/**
 * @title IAllowance
 * @notice Consolidated interface for the ERC-20 allowance domain: granting, reading and
 *         atomically adjusting spender allowances.
 */
interface IAllowance is IAllowanceTypes {
    /**
     * @notice Sets `amount` as the allowance of `spender` over the caller's tokens.
     * @dev Overwrites any previously-granted allowance. Known race: moving a non-zero
     *      allowance directly to another non-zero value lets `spender` spend both the old and
     *      the new amount via unfortunate transaction ordering — see EIP-20 discussion
     *      https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729. Prefer
     *      {increaseAllowance}/{decreaseAllowance}, or reset to zero before setting a new
     *      value. Emits {IAllowanceTypes.Approval} with the resulting allowance.
     * @param spender Address authorised to spend on the caller's behalf.
     * @param amount Absolute allowance amount to grant.
     * @return Boolean flag indicating whether the operation succeeded.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @notice Atomically increases the allowance granted to `spender` by the caller.
     * @dev Preferred alternative to {approve} as it avoids the read-modify-write allowance
     *      race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the
     *      zero address. Emits {IAllowanceTypes.Approval} with the resulting allowance.
     * @param spender Address whose allowance is being increased.
     * @param addedValue Amount added to the existing allowance.
     * @return Boolean flag indicating whether the operation succeeded.
     */
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);

    /**
     * @notice Atomically decreases the allowance granted to `spender` by the caller.
     * @dev Preferred alternative to {approve} as it avoids the read-modify-write allowance
     *      race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the
     *      zero address, or with {IAllowanceTypes.InsufficientAllowance} when the current
     *      allowance is below `subtractedValue`. Emits {IAllowanceTypes.Approval} with the
     *      resulting allowance.
     * @param spender Address whose allowance is being decreased.
     * @param subtractedValue Amount subtracted from the existing allowance.
     * @return Boolean flag indicating whether the operation succeeded.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);

    /**
     * @notice Returns the remaining amount `spender` may spend on behalf of `owner` via a
     *         downstream `transferFrom`-style call.
     * @dev Zero by default. Updated by {approve}, {increaseAllowance}, {decreaseAllowance} and
     *      by any consuming transfer operation. The returned value is time-travel adjusted at
     *      the current block timestamp on the implementing facet.
     * @param owner Address that granted the allowance.
     * @param spender Address authorised to spend on `owner`'s behalf.
     * @return Remaining allowance of `spender` over `owner`'s tokens.
     */
    function allowance(address owner, address spender) external view returns (uint256);
}
