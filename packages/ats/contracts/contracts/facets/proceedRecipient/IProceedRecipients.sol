// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey ProceedRecipients
bytes32 constant RESOLVER_KEY_PROCEED_RECIPIENTS = 0x63388aa198df5944c611b8fcbfd32945c57864f7125a5f95069040087d2b0bb7;

/**
 * @title IProceedRecipients
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing the set of proceed recipients registered on a token.
 * @dev Proceed recipients are addresses entitled to receive token proceeds (e.g. on redemption).
 *      Provides one-shot initialisation, CRUD operations, and paginated read queries.
 */
interface IProceedRecipients {
    /// @notice Emitted once when the ProceedRecipients capability is initialised on a token.
    /// @dev Fires exclusively from `initializeProceedRecipients` after the storage write succeeds.
    /// @param proceedRecipients Initial array of registered proceed-recipient addresses.
    /// @param data Arbitrary per-recipient data supplied at initialisation time.
    event ProceedRecipientsInitialized(address[] proceedRecipients, bytes[] data);

    /// @notice Emitted when a new proceed recipient is added to the token.
    /// @param operator Address that executed the add operation.
    /// @param proceedRecipient Address added as a proceed recipient.
    /// @param data Arbitrary data associated with the new recipient.
    event ProceedRecipientAdded(address indexed operator, address indexed proceedRecipient, bytes data);

    /// @notice Emitted when an existing proceed recipient is removed from the token.
    /// @param operator Address that executed the remove operation.
    /// @param proceedRecipient Address removed from the proceed-recipient set.
    event ProceedRecipientRemoved(address indexed operator, address indexed proceedRecipient);

    /// @notice Emitted when the data associated with a proceed recipient is updated.
    /// @param operator Address that executed the update.
    /// @param proceedRecipient Address whose data was updated.
    /// @param newData New arbitrary data stored for the recipient.
    event ProceedRecipientDataUpdated(address indexed operator, address indexed proceedRecipient, bytes newData);

    /// @notice Thrown when attempting to add an address that is already registered as a proceed recipient.
    /// @param proceedRecipient The address that already exists in the proceed-recipient set.
    error ProceedRecipientAlreadyExists(address proceedRecipient);

    /// @notice Thrown when an operation targets an address that is not a registered proceed recipient.
    /// @param proceedRecipient The address that was not found in the proceed-recipient set.
    error ProceedRecipientNotFound(address proceedRecipient);

    /**
     * @notice Initialises the proceed-recipients capability with a seed list of recipients.
     * @param _proceedRecipients Initial array of proceed-recipient addresses to register.
     * @param _data Per-recipient arbitrary data, one entry per address in `_proceedRecipients`.
     */
    function initializeProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) external;

    /**
     * @notice Registers a new proceed recipient on the token.
     * @param _proceedRecipient Address to add as a proceed recipient.
     * @param _data Arbitrary data to associate with the new recipient.
     */
    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external;

    /**
     * @notice Removes an existing proceed recipient from the token.
     * @param _proceedRecipient Address to remove from the proceed-recipient set.
     */
    function removeProceedRecipient(address _proceedRecipient) external;

    /**
     * @notice Updates the arbitrary data stored for an existing proceed recipient.
     * @param _proceedRecipient Address of the recipient whose data should be updated.
     * @param _data New arbitrary data to store for the recipient.
     */
    function updateProceedRecipientData(address _proceedRecipient, bytes calldata _data) external;

    /**
     * @notice Returns whether the given address is a registered proceed recipient.
     * @param _proceedRecipient Address to check.
     * @return True if the address is a registered proceed recipient; false otherwise.
     */
    function isProceedRecipient(address _proceedRecipient) external view returns (bool);

    /**
     * @notice Returns the arbitrary data stored for a registered proceed recipient.
     * @param _proceedRecipient Address of the proceed recipient to query.
     * @return Arbitrary data associated with the recipient.
     */
    function getProceedRecipientData(address _proceedRecipient) external view returns (bytes memory);

    /// @notice Returns the total number of registered proceed recipients.
    /// @return Total count of proceed recipients currently registered on the token.
    function getProceedRecipientsCount() external view returns (uint256);

    /**
     * @notice Returns a paginated slice of the registered proceed-recipient addresses.
     * @param _pageIndex Zero-based index of the page to retrieve.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return proceedRecipients_ Array of proceed-recipient addresses for the requested page.
     */
    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory proceedRecipients_);
}
