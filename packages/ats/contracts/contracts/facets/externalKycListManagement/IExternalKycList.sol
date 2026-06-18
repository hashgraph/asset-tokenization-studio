// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../kyc/IKyc.sol";

/**
 * @title  IExternalKycList
 * @author Asset Tokenization Studio Team
 * @notice Minimal interface for querying an external KYC-list contract.
 * @dev    Implemented by third-party KYC registries whose address is registered on the
 *         token. The token calls `getKycStatus` to verify whether an account has passed
 *         KYC checks before allowing it to participate in token operations.
 */
interface IExternalKycList {
    /**
     * @notice Returns the KYC status of `account` as recorded in the external KYC list.
     * @param account Address to check.
     * @return The `IKyc.KycStatus` value for the given account.
     */
    function getKycStatus(address account) external view returns (IKyc.KycStatus);
}
