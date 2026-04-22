// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../kyc/IKyc.sol";

/**
 * @title IExternal KYC List Interface
 * @notice Minimal interface that external KYC list contracts must implement to integrate
 *         with the asset tokenisation platform's identity verification layer.
 * @dev Implement this interface in any third-party KYC contract to make it compatible
 *      with `ExternalListManagementStorageWrapper.isExternallyGranted`.
 * @author io.builders
 */
interface IExternalKycList {
    /**
     * @notice Returns the KYC status of an account as recorded by this external KYC list.
     * @param account The address whose KYC status is queried.
     * @return The `IKyc.KycStatus` value assigned to `account` by this list.
     */
    function getKycStatus(address account) external view returns (IKyc.KycStatus);
}
