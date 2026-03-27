// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";

/**
 * @title ComplianceModifiers
 * @dev Abstract contract providing ERC1594 compliance modifiers
 *
 * This contract wraps ERC1594StorageWrapper and ERC1410StorageWrapper library
 * functions into modifiers for convenient use in facets.
 *
 * @notice Inherit from this contract to gain access to compliance modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ComplianceModifiers {
    /**
     * @dev Modifier that validates transfer compliance for partition
     *
     * Requirements:
     * - From address must be compliant
     * - To address must be compliant
     * - Sender must be compliant if checkSender is true
     * - All compliance checks must pass (ControlList, KYC, SSI)
     *
     * @param from Sender address
     * @param to Recipient address
     * @param partition Partition identifier
     * @param value Transfer amount
     */
    modifier onlyCanTransferFromByPartition(address from, address to, bytes32 partition, uint256 value) {
        ERC1594StorageWrapper.requireCanTransferFromByPartition(from, to, partition, value);
        _;
    }

    /**
     * @dev Modifier that validates redeem compliance for partition
     *
     * Requirements:
     * - From address must be compliant
     * - All compliance checks must pass (ControlList, KYC, SSI)
     * - Redeem operation must be allowed
     *
     * @param from Token holder address
     * @param partition Partition identifier
     * @param value Redeem amount
     */
    modifier onlyCanRedeemFromByPartition(address from, bytes32 partition, uint256 value) {
        ERC1594StorageWrapper.requireCanRedeemFromByPartition(from, partition, value);
        _;
    }
}
