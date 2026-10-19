// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreezeTypes } from "./IFreezeTypes.sol";

/// @custom:hash resolverKey Freeze
bytes32 constant RESOLVER_KEY_FREEZE = 0xad51c3d79dbb37543854270a7bd1c7237cfa425b16cdf4dee9015c20917ced5a;

/**
 * @title IFreeze
 * @author Asset Tokenization Studio Team
 * @notice Interface for freezing and unfreezing token balances and wallet addresses on a security
 *         token. Partial freezes lock a specific token amount while address freezes block all
 *         token operations for the affected wallet.
 * @dev Part of the Diamond facet system. Freeze state is stored via `ERC3643StorageWrapper`.
 *      Partial token freeze/unfreeze operations are restricted to single-partition tokens.
 *      Both `ROLE_FREEZE_MANAGER` and `ROLE_AGENT` are authorised to call all mutating
 *      functions. Freezing tokens reduces the holder's liquid balance; unfreezing restores it
 *      and emits a `Transfer` event from `address(0)`.
 */
interface IFreeze is IFreezeTypes {
    /**
     * @notice Emitted once when the freeze capability is initialised on a token.
     * @dev Fires exclusively from `initializeFreeze`.
     */
    event FreezeInitialized();

    /**
     * @notice Reverts when a partial token freeze is attempted with a zero amount.
     * @dev Checked at the start of `ERC3643StorageWrapper.freezeTokens`, the entry point for
     *      partial token freezes. Freezing zero tokens is semantically invalid and rejected
     *      early.
     */
    error InvalidFreezeAmount();

    /**
     * @notice Initialises the freeze capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeFreeze() external;

    /**
     * @notice Freezes a specific amount of tokens for a wallet, reducing its liquid balance.
     * @dev Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero
     *      non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`).
     *      Updates balance snapshots before mutating frozen state. Emits `TokensFrozen` with
     *      the default partition.
     * @param _userAddress The address whose tokens are to be frozen.
     * @param _amount The amount of tokens to freeze.
     */
    function freezePartialTokens(address _userAddress, uint256 _amount) external;

    /**
     * @notice Unfreezes a specific amount of previously frozen tokens for a wallet, restoring
     *         them to the liquid balance.
     * @dev Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero
     *      non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`).
     *      Validates that `_amount` does not exceed the currently frozen balance. Updates balance
     *      snapshots before mutating frozen state. Emits `TokensUnfrozen` with the default
     *      partition.
     * @param _userAddress The address whose tokens are to be unfrozen.
     * @param _amount The amount of tokens to unfreeze.
     */
    function unfreezePartialTokens(address _userAddress, uint256 _amount) external;

    /**
     * @notice Sets the address-level frozen status for a wallet, blocking or restoring all token
     *         operations for that address.
     * @dev Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, and a
     *      non-zero non-recovered address. Not restricted to single-partition tokens. Emits
     *      `AddressFrozen`.
     * @param _userAddress The address whose frozen status is to be updated.
     * @param _freezeStatus `true` to freeze the address, `false` to unfreeze it.
     */
    function setAddressFrozen(address _userAddress, bool _freezeStatus) external;

    /**
     * @notice Returns the total amount of tokens currently frozen for a wallet.
     * @param _userAddress The address to query.
     * @return The total frozen token amount for `_userAddress` across all partitions.
     */
    function getFrozenTokens(address _userAddress) external view returns (uint256);

    /**
     * @notice Returns the freezing status of a wallet.
     * @dev returning true mean that some token or all of them are frozen
     * @param _userAddress The address of the wallet on which isFrozen is called.
     * @return The freezing status of a wallet.
     */
    function isFrozen(address _userAddress) external view returns (bool);
}
