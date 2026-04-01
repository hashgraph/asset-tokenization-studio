// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IAmortizationStorageWrapper {
    struct AmortizationHoldInfo {
        uint256 holdId; // 0 = no hold
        bool holdActive; // true = hold active, waiting for DVP/burn
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
     * @notice Emitted when a hold is created or replaced for a token holder in an amortization.
     * @param corporateActionId Unique identifier grouping related corporate actions.
     * @param amortizationID Identifier of the amortization.
     * @param tokenHolder Address of the token holder.
     * @param holdId ID of the newly created hold.
     * @param tokenAmount Amount of tokens locked in the hold.
     */
    event AmortizationHoldSet(
        bytes32 indexed corporateActionId,
        uint256 indexed amortizationID,
        address indexed tokenHolder,
        uint256 holdId,
        uint256 tokenAmount
    );

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
}
