// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransferAndLockTypes } from "./ITransferAndLockTypes.sol";

/**
 * @title ITransferAndLock
 * @author Asset Tokenization Studio Team
 * @notice Interface for transferring tokens to a recipient and immediately locking them until
 *         a specified expiration timestamp using the default partition.
 */
interface ITransferAndLock is ITransferAndLockTypes {
    /**
     * @notice Emitted once when the transfer-and-lock capability is initialised on a token.
     * @dev Fires exclusively from `initializeTransferAndLock`.
     */
    event TransferAndLockInitialized();

    /**
     * @notice Initialises the transfer-and-lock capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeTransferAndLock() external;

    /**
     * @notice Transfers tokens to a specified address and locks them until the expiration timestamp
     *         using the default partition.
     * @param _to The address to which tokens will be transferred and locked.
     * @param _amount The amount of tokens to be transferred and locked.
     * @param _data Additional data with no specified format, sent in the call to `_to`.
     * @param _expirationTimestamp The timestamp until which the tokens will be locked.
     * @return lockId_ The identifier assigned to the new hold created for the locked tokens.
     */
    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external returns (uint256 lockId_);
}
