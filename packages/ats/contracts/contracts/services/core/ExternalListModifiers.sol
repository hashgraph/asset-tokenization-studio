// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title ExternalListModifiers
 * @notice Abstract contract providing external list management modifiers
 * @dev Provides modifiers for external control list and KYC list initialization validation
 *      using _check* pattern from ExternalListManagementStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract ExternalListModifiers {
    modifier onlyNotExternalControlListInitialized() {
        checkNotInitialized(ExternalListManagementStorageWrapper.isExternalControlListInitialized());
        _;
    }

    modifier onlyNotKycExternalInitialized() {
        checkNotInitialized(ExternalListManagementStorageWrapper.isKycExternalInitialized());
        _;
    }
}
