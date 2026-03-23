// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import { KycStorageWrapper } from "../../domain/core/KycStorageWrapper.sol";

/**
 * @title KycModifiers
 * @dev Abstract contract providing modifiers for KYC validation
 *
 * This contract wraps KycStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping KycStorageWrapper as a library (required for ERC1594StorageWrapper compatibility).
 *
 * @notice Inherit from this contract to gain access to KYC validation modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract KycModifiers {
    /**
     * @dev Modifier that validates KYC status for an account
     *
     * Requirements:
     * - Account must have the required KYC status (GRANTED, NOT_GRANTED, etc.)
     * - Internal KYC must be validated if activated
     * - External KYC must be validated via SSI/Revocation lists
     *
     * @param _kycStatus The required KYC status
     * @param _account The address to validate
     */
    modifier onlyValidKycStatus(IKyc.KycStatus _kycStatus, address _account) {
        KycStorageWrapper.requireValidKycStatus(_kycStatus, _account);
        _;
    }
}
