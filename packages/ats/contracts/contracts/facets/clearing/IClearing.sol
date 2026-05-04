// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";

/**
 * @title IClearing
 * @author Asset Tokenization Studio Team
 * @notice Interface for the clearing module global state and account-level read queries.
 * @dev Exposes the one-shot initializer (`initializeClearing`), the lifecycle toggles
 *      (`activateClearing` / `deactivateClearing`), the activation status query
 *      (`isClearingActivated`), and the account-scoped read queries
 *      (`getClearedAmountFor`, `getClearingThirdParty`).
 *      Partition-scoped operations and reads remain on `IClearingByPartition`.
 */
interface IClearing is IClearingTypes {
    /**
     * @notice Initializes the clearing module with the given activation state
     * @dev Can only be called once per token; subsequent calls revert with `AlreadyInitialized`
     * @param _activateClearing Whether clearing should be activated on initialization
     */
    function initializeClearing(bool _activateClearing) external;

    /**
     * @notice Activates the clearing functionality
     * @return success_ True when the activation completes successfully
     */
    function activateClearing() external returns (bool success_);

    /**
     * @notice Deactivates the clearing functionality
     * @return success_ True when the deactivation completes successfully
     */
    function deactivateClearing() external returns (bool success_);

    /**
     * @notice Returns whether the clearing functionality is activated or not
     * @return True if activated, false otherwise
     */
    function isClearingActivated() external view returns (bool);

    /**
     * @notice Gets the total cleared amount for a token holder across all partitions
     * @param _tokenHolder The address of the token holder
     * @return amount_ Total cleared amount currently locked for the holder
     */
    function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @notice Gets the address of the party that initiated the clearing operation
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingOperationType Type of clearing operation (Transfer, Redeem, or HoldCreation)
     * @param _clearingId Identifier of the clearing operation
     * @return thirdParty_ Address that initiated the clearing operation
     */
    function getClearingThirdParty(
        bytes32 _partition,
        address _tokenHolder,
        IClearingTypes.ClearingOperationType _clearingOperationType,
        uint256 _clearingId
    ) external view returns (address thirdParty_);
}
