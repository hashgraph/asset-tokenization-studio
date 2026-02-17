// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListModifiers } from "../controlList/ControlListModifiers.sol";
import { IKyc } from "../../../layer_1/interfaces/kyc/IKyc.sol";

abstract contract KycModifiers is ControlListModifiers {
    // ===== KYC Modifiers =====
    modifier onlyValidDates(uint256 _validFrom, uint256 _validTo) virtual;
    modifier onlyValidKycStatus(IKyc.KycStatus _kycStatus, address _account) virtual;
}
