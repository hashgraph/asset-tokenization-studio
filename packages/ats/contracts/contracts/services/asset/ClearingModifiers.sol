// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { ClearingStorageWrapper } from "../../domain/asset/ClearingStorageWrapper.sol";
import { checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title ClearingModifiers
 * @notice Abstract contract providing clearing-related modifiers
 * @dev Provides modifiers for clearing state validation using _check* pattern
 *      from ClearingStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract ClearingModifiers {
    /**
     * @notice Modifier to ensure clearing is not activated
     * @dev Reverts if clearing is activated
     */
    modifier onlyClearingDisabled() {
        ClearingStorageWrapper.checkClearingDisabled();
        _;
    }

    /**
     * @notice Modifier to ensure clearing is activated
     * @dev Reverts if clearing is not activated
     */
    modifier onlyClearingActivated() {
        ClearingStorageWrapper.requireClearingActivated();
        _;
    }

    /**
     * @notice Modifier to ensure clearing operation is valid
     * @dev Reverts if clearing ID is invalid
     * @param _clearingOperationIdentifier The clearing operation identifier to validate
     */
    modifier onlyWithValidClearingId(IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier) {
        ClearingStorageWrapper.requireValidClearingId(_clearingOperationIdentifier);
        _;
    }

    /**
     * @notice Modifier to ensure clearing has not been initialized
     * @dev Reverts with AlreadyInitialized if clearing is already initialized
     */
    modifier onlyNotClearingInitialized() {
        checkNotInitialized(ClearingStorageWrapper.isClearingInitialized());
        _;
    }

    modifier onlyValidOperatorClearingTransferByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        bytes32 _partition
    ) {
        ClearingStorageWrapper.checkOperatorClearingTransferByPartition(
            _expirationTimestamp,
            _account,
            _to,
            _from,
            _partition
        );
        _;
    }

    modifier onlyValidClearingCreateHoldByPartition(
        uint256 _holdExpirationTimestamp,
        uint256 _operationExpirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) {
        ClearingStorageWrapper.checkClearingCreateHoldByPartition(
            _holdExpirationTimestamp,
            _operationExpirationTimestamp,
            _account,
            _to,
            _from,
            _escrow,
            _partition
        );
        _;
    }

    modifier onlyValidOperatorClearingCreateHoldByPartition(
        uint256 _holdExpirationTimestamp,
        uint256 _operationExpirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) {
        ClearingStorageWrapper.checkOperatorClearingCreateHoldByPartition(
            _holdExpirationTimestamp,
            _operationExpirationTimestamp,
            _account,
            _to,
            _from,
            _escrow,
            _partition
        );
        _;
    }
}
