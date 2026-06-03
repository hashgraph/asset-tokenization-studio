// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Amortization
bytes32 constant RESOLVER_KEY_AMORTIZATION = 0xc0d83d8b9295f78954b1c7c9648bec9775edf597a57f9f4110883e9ca2134739;

/**
 * @title IAmortization
 * @author Asset Tokenization Studio Team
 * @notice Writer interface for the amortization facet — corporate-action driven token redemption.
 * @dev Defines the events, errors, structs, and functions used to register, fund, hold, and
 *      cancel amortization corporate actions across the token holder set.
 */
interface IAmortization {
    /// @notice Core amortization data structure
    /// @dev Stores the record/execution dates and the total amount of tokens to redeem (burn) across all holders.
    ///      Per-holder token amounts are submitted off-chain by the backend via `setAmortizationHold`.
    struct Amortization {
        uint256 recordDate;
        uint256 executionDate;
        uint256 tokensToRedeem;
    }

    /// @notice Registered amortization with snapshot reference
    /// @dev Links an amortization to a specific token holder snapshot
    struct RegisteredAmortization {
        Amortization amortization;
        uint256 snapshotId;
    }

    /// @notice Amortization payment information for a specific account
    /// @dev Contains amortization details and account-specific payment data
    struct AmortizationFor {
        uint256 recordDate;
        uint256 executionDate;
        // Hold info (current values, adjusted as of now)
        uint256 holdId; // 0 = no hold created yet
        bool holdActive; // true = hold is active and awaiting DVP execution
        uint256 tokenHeldAmount; // hold amount adjusted at current block time (0 if no hold)
        uint8 decimalsHeld; // token decimals at current block time (0 if no hold)
        uint256 abafAtHold; // ABAF at current block time (0 if no hold)
        // Snapshot (historical values at record date)
        uint256 tokenBalance; // balance at snapshot (or adjusted at recordDate if no snapshot yet)
        uint8 decimalsBalance; // decimals at snapshot
        bool recordDateReached; // whether record date has been reached
        uint256 abafAtSnapshot; // ABAF at snapshot (0 if record date not reached yet)
        // Nominal value
        uint256 nominalValue; // face value of the token
        uint8 nominalValueDecimals; // decimals of the nominal value
    }

    /**
     * @notice Emitted when an amortization is created or updated for a security.
     * @param corporateActionId Unique identifier grouping related corporate actions.
     * @param amortizationId Identifier of the created or updated amortization.
     * @param operator Address that performed the operation.
     * @param recordDate Date at which token holder balances are snapshotted.
     * @param executionDate Date at which the amortization payment is executed.
     */
    event AmortizationSet(
        bytes32 corporateActionId,
        uint256 amortizationId,
        address indexed operator,
        uint256 recordDate,
        uint256 executionDate
    );

    /**
     * @notice Emitted when an amortization is cancelled.
     * @param amortizationId Identifier of the cancelled amortization.
     * @param operator Address that performed the cancellation.
     */
    event AmortizationCancelled(uint256 amortizationId, address indexed operator);

    /**
     * @notice Emitted when an admin force-cancels an amortization, bypassing date guards.
     * @param amortizationId Identifier of the force-cancelled amortization.
     * @param operator Address that performed the force-cancellation.
     */
    event AmortizationForceCancelled(uint256 amortizationId, address indexed operator);


    /**
     * @notice Emitted when a hold is released for a token holder in an amortization.
     * @param corporateActionId Unique identifier grouping related corporate actions.
     * @param amortizationID Identifier of the amortization.
     * @param tokenHolder Address of the token holder whose hold was released.
     * @param holdId ID of the released hold.
     */
    event AmortizationHoldReleased(
        bytes32 indexed corporateActionId,
        uint256 indexed amortizationID,
        address indexed tokenHolder,
        uint256 holdId
    );

    /**
     * @notice Emitted once when the amortization capability is initialised on a token.
     * @dev Fires exclusively from `initializeAmortization`.
     */
    event AmortizationInitialized();

    /**
     * @notice Amortization creation failed due to an internal failure.
     */
    error AmortizationCreationFailed();

    /**
     * @notice Amortization execution failed because the amortization has already been executed.
     * @param corporateActionId The corporate action ID of the already-executed amortization.
     * @param amortizationId The amortization ID that was already executed.
     */
    error AmortizationAlreadyExecuted(bytes32 corporateActionId, uint256 amortizationId);

    /**
     * @notice Thrown when creating a hold for an amortization fails.
     * @param corporateActionId The corporate action ID of the amortization.
     * @param amortizationID The amortization ID for which hold creation failed.
     */
    error AmortizationHoldFailed(bytes32 corporateActionId, uint256 amortizationID);

    /**
     * @notice Thrown when attempting to cancel an amortization that still has active holds.
     * @param corporateActionId The corporate action ID of the amortization.
     * @param amortizationID The amortization ID that still has pending holds.
     */
    error AmortizationHasActiveHolds(bytes32 corporateActionId, uint256 amortizationID);

    /**
     * @notice Thrown when attempting to release a hold that is not active for the given holder.
     * @param corporateActionId The corporate action ID of the amortization.
     * @param amortizationID The amortization ID.
     * @param tokenHolder The address of the token holder with no active hold.
     */
    error AmortizationHoldNotActive(bytes32 corporateActionId, uint256 amortizationID, address tokenHolder);

    /**
     * @notice Thrown when attempting to operate on a cancelled amortization.
     * @param corporateActionId The corporate action ID of the amortization.
     * @param amortizationID The amortization ID.
     */
    error AmortizationNotActive(bytes32 corporateActionId, uint256 amortizationID);

    /**
     * @notice Thrown when attempting to set a hold with a zero token amount.
     * @param amortizationID The amortization ID.
     */
    error InvalidAmortizationHoldAmount(uint256 amortizationID);

    /**
     * @notice Initialises the amortization capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeAmortization() external;

    /**
     * @notice Sets a new amortization for the security.
     * @param _amortization The amortization data to register.
     * @return success_ Whether the operation succeeded.
     * @return amortizationID_ The ID of the newly created amortization.
     */
    function setAmortization(
        Amortization calldata _amortization
    ) external returns (bool success_, uint256 amortizationID_);

    /**
     * @notice Cancels an existing amortization.
     * @dev Reverts if any token holder still has an active hold for this amortization.
     *      All holds must be released via `releaseAmortizationHold` before cancellation is allowed.
     * @param _amortizationID The ID of the amortization to cancel.
     */
    function cancelAmortization(uint256 _amortizationID) external;

    /**
     * @notice Force-cancels an amortization regardless of its execution date.
     * @dev Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state,
     *      `onlyWithoutMultiPartition`, and `onlyMatchingActionType`. Marks the corporate action
     *      disabled unconditionally — bypasses `AmortizationAlreadyExecuted` and
     *      `AmortizationNotActive` — and emits `AmortizationForceCancelled`.
     * @param _amortizationID The ID of the amortization to force-cancel.
     */
    function forceCancelAmortization(uint256 _amortizationID) external;

    /**
     * @notice Releases the active hold for a specific token holder in an amortization.
     * @dev Must be called for every holder with an active hold before `cancelAmortization` can succeed.
     *      Reverts if the holder has no active hold for this amortization.
     * @param _amortizationID The ID of the amortization.
     * @param _tokenHolder The address of the token holder whose hold will be released.
     */
    function releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) external;

    /**
     * @notice Creates or replaces the hold for a specific token holder in an amortization.
     * @dev If the holder already has a pending hold, it is released first.
     * @param _amortizationID The ID of the amortization.
     * @param _tokenHolder The address of the token holder.
     * @param _tokenAmount The number of tokens to lock in the hold.
     * @return holdId_ The ID of the newly created hold.
     */
    function setAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    ) external returns (uint256 holdId_);

    /**
     * @notice Retrieves a registered amortization by its ID.
     * @param _amortizationID The ID of the amortization to retrieve.
     * @return registeredAmortization_ The registered amortization data.
     * @return isDisabled_ Whether the amortization is disabled.
     */
    function getAmortization(
        uint256 _amortizationID
    ) external view returns (RegisteredAmortization memory registeredAmortization_, bool isDisabled_);

    /**
     * @notice Retrieves amortization payment information for a specific account.
     * @param _amortizationID The ID of the amortization.
     * @param _account The account address.
     * @return amortizationFor_ Amortization payment information for the specified account.
     */
    function getAmortizationFor(
        uint256 _amortizationID,
        address _account
    ) external view returns (AmortizationFor memory amortizationFor_);

    /**
     * @notice Retrieves amortization payment information for multiple holders (paginated).
     * @param _amortizationID The ID of the amortization.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of records per page.
     * @return amortizationsFor_ List of amortization payment information per holder.
     * @return holders_ The holder addresses aligned by index with `amortizationsFor_`.
     */
    function getAmortizationsFor(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (AmortizationFor[] memory amortizationsFor_, address[] memory holders_);

    /**
     * @notice Retrieves the total number of amortizations set for the security.
     * @dev Cancelled amortizations are included in the count.
     * @return amortizationCount_ The total count of registered amortizations.
     */
    function getAmortizationsCount() external view returns (uint256 amortizationCount_);

    /**
     * @notice Retrieves a paginated list of amortization holders for a specific amortization ID.
     * @param _amortizationID The ID of the amortization.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of holders per page.
     * @return holders_ Array of holder addresses.
     */
    function getAmortizationHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Retrieves the total number of amortization holders for a specific amortization ID.
     * @dev It is the list of token holders at the snapshot taken at the record date.
     * @param _amortizationID The ID of the amortization.
     * @return The total number of amortization holders.
     */
    function getTotalAmortizationHolders(uint256 _amortizationID) external view returns (uint256);

    /**
     * @notice Retrieves a paginated list of token holders that still have an active hold for a given amortization.
     * @dev Use this to identify which holders must have their hold released before `cancelAmortization` can succeed.
     * @param _amortizationID The ID of the amortization.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of holders per page.
     * @return holders_ Array of addresses with an active hold for this amortization.
     */
    function getAmortizationActiveHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Retrieves the total number of token holders that still have an active hold for a given amortization.
     * @param _amortizationID The ID of the amortization.
     * @return The total count of holders with an active hold.
     */
    function getTotalAmortizationActiveHolders(uint256 _amortizationID) external view returns (uint256);

    /**
     * @notice Retrieves the total amount of tokens locked in holds for a given amortization.
     * @param _amortizationID The ID of the amortization.
     * @return The total token amount held across all active holds for this amortization.
     */
    function getTotalHoldByAmortizationId(uint256 _amortizationID) external view returns (uint256);

    /**
     * @notice Retrieves a paginated list of non-cancelled amortization IDs.
     * @dev Cancelled amortizations (isDisabled=true) are excluded from the result.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of records per page.
     * @return activeIds_ Array of amortization IDs that have not been cancelled.
     */
    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory activeIds_);

    /**
     * @notice Retrieves the total number of non-cancelled amortizations.
     * @return The total count of active (non-cancelled) amortization IDs.
     */
    function getTotalActiveAmortizationIds() external view returns (uint256);
}
