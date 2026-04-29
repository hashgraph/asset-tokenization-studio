// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { IClearingTypes } from "../layer_1/clearing/IClearingTypes.sol";

/**
 * @title IClearingHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the unprotected clearing hold creation operations scoped to a partition.
 * @dev Extends IClearingTypes. Covers the self-initiated and third-party-authorized clearing hold
 *      creation paths plus the corresponding read query. The protected variant
 *      (protectedClearingCreateHoldByPartition) is declared in IClearingHoldCreation.
 */
interface IClearingHoldByPartition is IClearingTypes {
    /**
     * @notice Creates a hold for a clearing operation by partition
     *
     * @param _clearingOperation The clearing operation details
     * @param _hold The hold details
     * @return success_ True if the clearing hold was created successfully
     * @return clearingId_ Identifier assigned to the new clearing operation
     */
    function clearingCreateHoldByPartition(
        IClearingTypes.ClearingOperation calldata _clearingOperation,
        IHoldTypes.Hold calldata _hold
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a hold for a clearing operation by partition from a third party
     * @dev Caller needs to have approval to transfer the tokens from the token holder.
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _hold The hold details
     * @return success_ True if the clearing hold was created successfully
     * @return clearingId_ Identifier assigned to the new clearing operation
     */
    function clearingCreateHoldFromByPartition(
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldTypes.Hold calldata _hold
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Gets the clearing hold creation data for a given partition, token holder and clearing ID
     *
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingId The ID of the clearing operation
     *
     * @return clearingHoldCreationData_ The clearing hold creation data
     */
    function getClearingCreateHoldForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view returns (IClearingTypes.ClearingHoldCreationData memory clearingHoldCreationData_);
}
