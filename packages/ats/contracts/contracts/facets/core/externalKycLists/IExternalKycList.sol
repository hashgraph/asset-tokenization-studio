// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../kyc/IKyc.sol";

interface IExternalKycList {
    /**
     * @notice Gets user KYC status from the external KYC list contract
     */
    function getKycStatus(address account) external view returns (IKyc.KycStatus);
}
