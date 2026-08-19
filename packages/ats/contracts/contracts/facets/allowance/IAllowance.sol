// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAllowanceTypes } from "./IAllowanceTypes.sol";

/// @custom:hash resolverKey Allowance
bytes32 constant RESOLVER_KEY_ALLOWANCE = 0x329473cfbe06c7719b3c986b04b90a16a859b86307aad33eea0c3dfe87160ab7;

/**
 * @title IAllowance
 * @author Asset Tokenization Studio Team
 * @notice Consolidated interface for the ERC-20 allowance domain: granting, reading and
 *         atomically adjusting spender allowances.
 */
interface IAllowance is IAllowanceTypes {
    /**
     * @notice Emitted once when the allowance capability is initialised on a token.
     * @dev Fires exclusively from `initializeAllowance` after the storage write succeeds.
     */
    event AllowanceInitialized();

    /**
     * @notice Raised when an operation encounters an allowance that is effectively unlimited.
     * @dev Indicates that the owner has granted the spender an infinite allowance, which may
     *      require special handling to avoid unintended accounting or revocation assumptions.
     * @param owner The account that granted the allowance.
     * @param spender The account authorised to spend on behalf of the owner.
     */
    error InfiniteAllowance(address owner, address spender);

    /**
     * @notice Initialises the allowance capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeAllowance() external;

    /**
     * @notice Sets `value` as the allowance of `spender` over the caller's tokens.
     * @dev Overwrites any previously-granted allowance. Known race: moving a non-zero
     *      allowance directly to another non-zero value lets `spender` spend both the old and
     *      the new amount via unfortunate transaction ordering — see EIP-20 discussion
     *      https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729. Prefer
     *      {increaseAllowance}/{decreaseAllowance}, or reset to zero before setting a new
     *      value. Emits {IAllowanceTypes.Approval} with the resulting allowance.
     * @param _spender Address authorised to spend on the caller's behalf.
     * @param _value Absolute allowance amount to grant.
     * @return Boolean flag indicating whether the operation succeeded.
     */
    function approve(address _spender, uint256 _value) external returns (bool);

    /**
     * @notice Atomically increases the allowance granted to `spender` by the caller.
     * @dev Preferred alternative to {approve} as it avoids the read-modify-write allowance
     *      race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the
     *      zero address. Emits {IAllowanceTypes.Approval} with the resulting allowance.
     * @param _spender Address whose allowance is being increased.
     * @param _addedValue Amount added to the existing allowance.
     * @return Boolean flag indicating whether the operation succeeded.
     */
    function increaseAllowance(address _spender, uint256 _addedValue) external returns (bool);

    /**
     * @notice Atomically decreases the allowance granted to `spender` by the caller.
     * @dev Preferred alternative to {approve} as it avoids the read-modify-write allowance
     *      race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the
     *      zero address, or with {IAllowanceTypes.InsufficientAllowance} when the current
     *      allowance is below `subtractedValue`. Emits {IAllowanceTypes.Approval} with the
     *      resulting allowance.
     * @param _spender Address whose allowance is being decreased.
     * @param _subtractedValue Amount subtracted from the existing allowance.
     * @return Boolean flag indicating whether the operation succeeded.
     */
    function decreaseAllowance(address _spender, uint256 _subtractedValue) external returns (bool);

    /**
     * @notice Returns the remaining amount `spender` may spend on behalf of `owner` via a
     *         downstream `transferFrom`-style call.
     * @dev Zero by default. Updated by {approve}, {increaseAllowance}, {decreaseAllowance} and
     *      by any consuming transfer operation. The returned value is time-travel adjusted at
     *      the current block timestamp on the implementing facet.
     * @param _owner Address that granted the allowance.
     * @param _spender Address authorised to spend on `owner`'s behalf.
     * @return Remaining allowance of `spender` over `owner`'s tokens.
     */
    function allowance(address _owner, address _spender) external view returns (uint256);
}
