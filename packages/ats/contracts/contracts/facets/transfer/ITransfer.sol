// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Transfer
bytes32 constant RESOLVER_KEY_TRANSFER = 0xdb0637d5ac2d3a8a460b63275e82a566d4b5ac4b9d2d2938f70c6612970a4b64;

/**
 * @title ITransferFacet
 * @author Asset Tokenization Studio Team
 * @notice Interface grouping all standard token transfer operations: ERC-20 style and
 *         ERC-1594 data-bearing style. Also owns the `Transfer` event and the
 *         `InsufficientBalance` error that were previously declared in `IERC20`.
 */
interface ITransfer {
    /**
     * @notice Emitted once when the transfer capability is initialised on a token.
     * @dev Fires exclusively from `initializeTransfer`.
     */
    event TransferInitialized();

    /**
     * @notice Emitted when tokens are transferred with an attached data payload.
     * @param sender Account that executed the transfer (typically `msg.sender`).
     * @param to Recipient of the transferred tokens.
     * @param amount Amount of tokens transferred, denominated in base units.
     * @param data Arbitrary payload supplied by the caller for off-chain interpretation.
     */
    event TransferWithData(address indexed sender, address indexed to, uint256 amount, bytes data);

    /**
     * @notice Emitted when tokens are transferred via an allowance with an attached data payload.
     * @param sender Account that executed the transfer (typically `msg.sender`).
     * @param from Address from which tokens were debited.
     * @param to Recipient of the transferred tokens.
     * @param amount Amount of tokens transferred, denominated in base units.
     * @param data Arbitrary payload supplied by the caller for off-chain interpretation.
     */
    event TransferFromWithData(
        address indexed sender,
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes data
    );

    /**
     * @notice Emitted whenever tokens move between accounts, are minted, or are burned.
     * @param from  Source account (zero address on mint).
     * @param to    Destination account (zero address on burn).
     * @param value Amount of tokens transferred.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @notice Thrown when a transfer or redemption is attempted with insufficient partition balance.
     * @param account   The account whose balance was checked.
     * @param balance   The actual balance available.
     * @param value     The amount that was requested.
     * @param partition The partition that was checked.
     */
    error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition);

    /**
     * @notice Initialises the transfer capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeTransfer() external;

    /**
     * @notice Moves `amount` tokens from the caller to `to`.
     * @param to     Recipient address.
     * @param amount Number of tokens to transfer.
     * @return True if the transfer succeeded.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @notice Moves `amount` tokens from `from` to `to` using the caller's allowance.
     * @param from   Source address.
     * @param to     Destination address.
     * @param amount Number of tokens to transfer.
     * @return True if the transfer succeeded.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    /**
     * @notice Transfers tokens to `_to` with additional `_data` attached.
     * @dev Only available in single-partition mode.
     * @param _to    Recipient address.
     * @param _value Amount of tokens to transfer.
     * @param _data  Arbitrary data attached to the transfer.
     */
    function transferWithData(address _to, uint256 _value, bytes calldata _data) external;

    /**
     * @notice Transfers tokens from `_from` to `_to` with additional `_data` attached.
     * @dev Caller must have a sufficient allowance set by `_from`. Only available in single-partition mode.
     * @param _from  Source address.
     * @param _to    Destination address.
     * @param _value Amount of tokens to transfer.
     * @param _data  Arbitrary data attached to the transfer.
     */
    function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external;
}
