// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import { IRevocationList } from "../../facets/layer_1/kyc/IRevocationList.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { SsiManagementStorageWrapper } from "./SsiManagementStorageWrapper.sol";
import { _KYC_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @notice Storage struct for KYC data
struct KycStorage {
    mapping(address => IKyc.KycData) kyc;
    mapping(IKyc.KycStatus => EnumerableSet.AddressSet) kycAddressesByStatus;
    bool initialized;
    bool internalKycActivated;
}

/// @title KycStorageWrapper
/// @notice Storage wrapper for KYC (Know Your Customer) management operations
/// @dev Manages KYC data storage including status, validity periods, and issuer information
/// @author Hashgraph
library KycStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Initialises KYC storage with internal KYC activation flag
    /// @param _internalKycActivated True to enable internal KYC checks
    function initializeInternalKyc(bool _internalKycActivated) internal {
        KycStorage storage ks = kycStorage();
        ks.initialized = true;
        ks.internalKycActivated = _internalKycActivated;
    }

    /// @notice Sets the internal KYC activation state
    /// @param _activated True to enable, false to disable
    /// @return success_ True if state was set
    function setInternalKyc(bool _activated) internal returns (bool success_) {
        kycStorage().internalKycActivated = _activated;
        success_ = true;
    }

    /// @notice Grants KYC to an account with Verifiable Credential details
    /// @param _account Account to grant KYC
    /// @param _vcId Verifiable Credential identifier
    /// @param _validFrom Start timestamp of validity
    /// @param _validTo End timestamp of validity
    /// @param _issuer Issuer of the KYC credential
    /// @return success_ True if KYC was granted
    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) internal returns (bool success_) {
        KycStorage storage $ = kycStorage();
        $.kyc[_account] = IKyc.KycData(_validFrom, _validTo, _vcId, _issuer, IKyc.KycStatus.GRANTED);
        $.kycAddressesByStatus[IKyc.KycStatus.GRANTED].add(_account);
        success_ = true;
    }

    /// @notice Revokes KYC from an account
    /// @param _account Account to revoke KYC from
    /// @return success_ True if KYC was revoked
    function revokeKyc(address _account) internal returns (bool success_) {
        delete kycStorage().kyc[_account];
        kycStorage().kycAddressesByStatus[IKyc.KycStatus.GRANTED].remove(_account);
        success_ = true;
    }

    /// @notice Validates KYC status for an account
    /// @param _kycStatus Expected KYC status
    /// @param _account Account to validate
    function requireValidKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view {
        if (!verifyKycStatus(_kycStatus, _account)) revert IKyc.InvalidKycStatus();
    }

    /// @notice Gets KYC status for an account at a specific timestamp
    /// @param _account Account to query
    /// @param _timestamp Timestamp to check status at
    /// @return KYC status enum value
    function getKycStatusFor(address _account, uint256 _timestamp) internal view returns (IKyc.KycStatus) {
        IKyc.KycData memory kycFor = getKycFor(_account);

        if (kycFor.validTo < _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (kycFor.validFrom > _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (!SsiManagementStorageWrapper.isIssuer(kycFor.issuer)) return IKyc.KycStatus.NOT_GRANTED;

        address revocationListAddress = SsiManagementStorageWrapper.getRevocationRegistryAddress();

        if (
            revocationListAddress != address(0) &&
            IRevocationList(revocationListAddress).revoked(kycFor.issuer, kycFor.vcId)
        ) return IKyc.KycStatus.NOT_GRANTED;

        return kycFor.status;
    }

    /// @notice Gets full KYC data for an account
    /// @param _account Account to query
    /// @return KycData struct with validity and issuer info
    function getKycFor(address _account) internal view returns (IKyc.KycData memory) {
        return kycStorage().kyc[_account];
    }

    /// @notice Gets count of accounts with a specific KYC status
    /// @param _kycStatus Status to count
    /// @return kycAccountsCount_ Number of accounts with status
    function getKycAccountsCount(IKyc.KycStatus _kycStatus) internal view returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = kycStorage().kycAddressesByStatus[_kycStatus].length();
    }

    /// @notice Gets paginated KYC accounts and their data for a status
    /// @param _kycStatus Status to filter by
    /// @param _pageIndex Page index for pagination
    /// @param _pageLength Number of items per page
    /// @return accounts_ Array of account addresses
    /// @return kycData_ Array of KYC data structs
    function getKycAccountsData(
        IKyc.KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory accounts_, IKyc.KycData[] memory kycData_) {
        accounts_ = kycStorage().kycAddressesByStatus[_kycStatus].getFromSet(_pageIndex, _pageLength);

        uint256 totalAccounts = accounts_.length;
        kycData_ = new IKyc.KycData[](totalAccounts);

        for (uint256 index; index < totalAccounts; ) {
            kycData_[index] = getKycFor(accounts_[index]);
            unchecked {
                ++index;
            }
        }
    }

    /// @notice Verifies KYC status combining internal and external checks
    /// @param _kycStatus Expected KYC status
    /// @param _account Account to verify
    /// @return True if status is valid
    function verifyKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view returns (bool) {
        bool internalKycValid = !kycStorage().internalKycActivated ||
            getKycStatusFor(_account, TimeTravelStorageWrapper.getBlockTimestamp()) == _kycStatus;
        return internalKycValid && ExternalListManagementStorageWrapper.isExternallyGranted(_account, _kycStatus);
    }

    /// @notice Checks if internal KYC is activated
    /// @return True if internal KYC is active
    function isInternalKycActivated() internal view returns (bool) {
        return kycStorage().internalKycActivated;
    }

    /// @notice Checks if KYC storage has been initialised
    /// @return True if initialised
    function isKycInitialized() internal view returns (bool) {
        return kycStorage().initialized;
    }

    /// @notice Returns the KycStorage storage pointer for the diamond storage position
    /// @return kyc_ Storage pointer to KycStorage
    function kycStorage() private pure returns (KycStorage storage kyc_) {
        bytes32 position = _KYC_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kyc_.slot := position
        }
    }
}
