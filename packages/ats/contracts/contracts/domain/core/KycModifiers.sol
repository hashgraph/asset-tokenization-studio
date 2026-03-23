// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import { KycStorageWrapper } from "./KycStorageWrapper.sol";

/**
 * @title KycModifiers
 * @notice Abstract contract providing KYC modifiers
 * @dev Provides modifiers for KYC validation using _check* pattern
 *      from KycStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract KycModifiers {
    modifier onlyValidKycStatus(IKyc.KycStatus _kycStatus, address _account) {
        KycStorageWrapper._checkValidKycStatus(_kycStatus, _account);
        _;
    }
}
