// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper } from "../../domain/asset/HoldStorageWrapper.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";

/**
 * @title HoldModifiers
 * @dev Abstract contract providing modifiers for Hold validation
 *
 * This contract wraps HoldStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping HoldStorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to Hold validation modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract HoldModifiers {
    /**
     * @dev Modifier that validates all preconditions for an operator to create
     * a hold by partition on behalf of a token holder.
     *
     * Requirements:
     * - `_expirationTimestamp` must be in the future.
     * - `_account`, `_to`, and `_from` must not be recovered addresses.
     * - `_from` and `_escrow` must be valid (non-zero) addresses.
     * - `_partition` must be the default partition in single-partition mode.
     * - `_account` must be an authorized operator for `_from` on `_partition`.
     *
     * @param _expirationTimestamp The hold expiration timestamp.
     * @param _account The operator creating the hold.
     * @param _to The recipient address of the hold.
     * @param _from The token holder whose tokens are being locked.
     * @param _escrow The escrow address holding the locked tokens.
     * @param _partition The partition on which the hold is created.
     */
    modifier onlyValidOperatorCreateHoldByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) {
        HoldStorageWrapper.checkOperatorCreateHoldByPartition(
            _expirationTimestamp,
            _account,
            _to,
            _from,
            _escrow,
            _partition
        );
        _;
    }

    /**
     * @dev Modifier that validates all preconditions for a token holder to
     * create a hold from their own account by partition.
     *
     * Requirements:
     * - `_expirationTimestamp` must be in the future.
     * - `_account`, `_to`, and `_from` must not be recovered addresses.
     * - `_from` and `_escrow` must be valid (non-zero) addresses.
     * - `_partition` must be the default partition in single-partition mode.
     *
     * @param _expirationTimestamp The hold expiration timestamp.
     * @param _account The token holder creating the hold.
     * @param _to The recipient address of the hold.
     * @param _from The token holder whose tokens are being locked.
     * @param _escrow The escrow address holding the locked tokens.
     * @param _partition The partition on which the hold is created.
     */
    modifier onlyValidCreateHoldFromByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) {
        HoldStorageWrapper.checkCreateHoldFromByPartition(
            _expirationTimestamp,
            _account,
            _to,
            _from,
            _escrow,
            _partition
        );
        _;
    }

    /**
     * @dev Modifier that verifies the given hold identifier refers to an
     * existing hold.
     *
     * Requirements:
     * - The hold identified by `_holdIdentifier` must exist (non-zero id).
     *
     * @param _holdIdentifier The hold identifier containing the token holder,
     * partition, and hold id to validate.
     */
    modifier onlyValidHoldId(IHoldTypes.HoldIdentifier calldata _holdIdentifier) {
        HoldStorageWrapper.requireValidHoldId(_holdIdentifier);
        _;
    }
}
