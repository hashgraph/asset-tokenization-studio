// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../clearing/IClearingTypes.sol";

/// @custom:hash resolverKey OperatorClearingByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_OPERATOR_CLEARING_BY_PARTITION = 0xaad3c9e6cb80e4d01b9e5f316a82f495c3d11d36f8d738b0c2e4bce2d3f6c01c;

/**
 * @title IOperatorClearingByPartition
 * @notice Interface for operator-initiated clearing operations: redeem and transfer by partition.
 */
interface IOperatorClearingByPartition is IClearingTypes {
    /**
     * @notice Emitted once when the operator-clearing-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeOperatorClearingByPartition`.
     */
    event OperatorClearingByPartitionInitialized();

    /**
     * @notice Initialises the operator-clearing-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeOperatorClearingByPartition() external;

    /**
     * @notice Creates a redeem clearing operation for a partition from a third party
     * @dev Caller needs to be a token holder operator
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to redeem
     */
    function operatorClearingRedeemByPartition(
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a transfer clearing operation for a partition from a third party
     * @dev Caller needs to be a token holder operator
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to transfer
     * @param _to The address to transfer the tokens to
     */
    function operatorClearingTransferByPartition(
        IClearingTypes.ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external returns (bool success_, uint256 clearingId_);
}
