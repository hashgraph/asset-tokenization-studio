// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "../../facets/kyc/IKyc.sol";
import { IRevocationList } from "../../facets/kyc/IRevocationList.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { SsiManagementStorageWrapper } from "./SsiManagementStorageWrapper.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @custom:hash storage Kyc
bytes32 constant STORAGE_LOCATION_KYC = 0x88f619eb35d79dd51bdbedb0638479d77479fa6ca039bb2a23ffdf42c8e30900;

/**
 * @notice Storage layout backing the internal KYC registry.
 * @dev Records the per-account `KycData` entry plus a per-status `EnumerableSet` of addresses so
 *      callers can paginate granted accounts efficiently. New fields must be appended below the
 *      APPEND-ONLY marker to preserve upgrade safety.
 * @custom:storage-location erc7201:security.token.standard.storage.Kyc
 */
struct KycStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool internalKycActivated;
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => IKyc.KycData) kyc;
    mapping(IKyc.KycStatus => EnumerableSet.AddressSet) kycAddressesByStatus;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title KycStorageWrapper
 * @notice Storage wrapper for KYC (Know Your Customer) management operations
 * @dev Manages KYC data storage including status, validity periods, and issuer information
 * @author Hashgraph
 */
library KycStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Marks the internal KYC subsystem as initialised and sets its activation flag.
     * @dev Single-shot setup; the calling facet enforces the "not yet initialised" precondition.
     * @param _internalKycActivated Initial value of the internal-KYC activation flag.
     */
    function initializeInternalKyc(bool _internalKycActivated) internal {
        _kycStorage().internalKycActivated = _internalKycActivated;
    }

    /**
     * @notice Toggles whether the internal KYC check participates in `verifyKycStatus`.
     * @param _activated New value of the internal-KYC activation flag.
     * @return success_ Always `true`; the boolean return preserves the facet's API contract.
     */
    function setInternalKyc(bool _activated) internal returns (bool success_) {
        _kycStorage().internalKycActivated = _activated;
        success_ = true;
    }

    /**
     * @notice Records a granted KYC entry for `_account` and adds it to the granted set.
     * @dev Overwrites any previous entry for `_account`; callers are responsible for ensuring the
     *      issuer is authorised. Gas-bounded by a single mapping write and one set insert. A KYC
     *      entry with GRANTED status may no longer be valid once its `validTo` has elapsed. To keep
     *      a clean list of granted accounts, expired entries must be explicitly removed via
     *      `revokeKyc`.
     * @param _account The address being granted KYC.
     * @param _vcId Verifiable credential identifier associated with the grant.
     * @param _validFrom Start of the validity window (inclusive, unix seconds).
     * @param _validTo End of the validity window (inclusive, unix seconds).
     * @param _issuer Address of the credential issuer.
     * @return success_ Always `true`; preserves the facet's API contract.
     */
    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) internal returns (bool success_) {
        KycStorage storage $ = _kycStorage();
        $.kyc[_account] = IKyc.KycData(_validFrom, _validTo, _vcId, _issuer, IKyc.KycStatus.GRANTED);
        $.kycAddressesByStatus[IKyc.KycStatus.GRANTED].add(_account);
        success_ = true;
    }

    /**
     * @notice Revokes the KYC entry for `_account` and removes it from the granted set.
     * @param _account The address whose KYC entry is revoked.
     * @return success_ Always `true`; preserves the facet's API contract.
     */
    function revokeKyc(address _account) internal returns (bool success_) {
        delete _kycStorage().kyc[_account];
        _kycStorage().kycAddressesByStatus[IKyc.KycStatus.GRANTED].remove(_account);
        success_ = true;
    }

    /**
     * @notice Reverts with `IKyc.InvalidKycStatus` when `_account` does not currently satisfy
     *         `_kycStatus`.
     * @param _kycStatus Required KYC status.
     * @param _account Address being checked.
     */
    function requireValidKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view {
        if (!verifyKycStatus(_kycStatus, _account)) revert IKyc.InvalidKycStatus();
    }

    /**
     * @notice Resolves the effective KYC status of `_account` at `_timestamp`.
     * @dev Returns `NOT_GRANTED` when the credential is outside its validity window, the issuer is
     *      no longer registered, or the credential has been revoked on the optional revocation
     *      list. Otherwise returns the stored status. A GRANTED entry whose `validTo` has elapsed
     *      is reported here as `NOT_GRANTED`. The GRANTED list is not pruned automatically;
     *      expired entries must be explicitly removed via `revokeKyc` to keep it clean.
     * @param _account Address whose status is being resolved.
     * @param _timestamp Timestamp used for validity-window checks.
     * @return KycStatus Effective KYC status for `_account` at `_timestamp`.
     */
    function getKycStatusFor(address _account, uint256 _timestamp) internal view returns (IKyc.KycStatus) {
        IKyc.KycData memory kycFor = getKycFor(_account);

        if (kycFor.validTo < _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (kycFor.validFrom > _timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (!SsiManagementStorageWrapper.isIssuer(kycFor.issuer)) return IKyc.KycStatus.NOT_GRANTED;

        address revocationListAddress = SsiManagementStorageWrapper.getRevocationRegistryAddress();

        if (revocationListAddress != address(0)) {
            try IRevocationList(revocationListAddress).revoked(kycFor.issuer, kycFor.vcId) returns (bool revoked) {
                if (revoked) {
                    return IKyc.KycStatus.NOT_GRANTED;
                }
            } catch {
                return IKyc.KycStatus.NOT_GRANTED;
            }
        }

        return kycFor.status;
    }

    /**
     * @notice Returns the raw stored KYC entry for `_account`.
     * @dev The status field is not re-evaluated against validity or revocation; for the effective
     *      status use `getKycStatusFor`.
     * @param _account Address whose entry is returned.
     * @return data_ The stored `KycData` for `_account`; zero-valued when never granted.
     */
    function getKycFor(address _account) internal view returns (IKyc.KycData memory data_) {
        return _kycStorage().kyc[_account];
    }

    /**
     * @notice Returns the number of accounts currently recorded under `_kycStatus`.
     * @dev For `GRANTED`, the count may include entries whose `validTo` has elapsed and are
     *      therefore no longer valid. To keep a clean list, expired entries must be explicitly
     *      removed via `revokeKyc`.
     * @param _kycStatus KYC status whose membership count is returned.
     * @return kycAccountsCount_ Number of accounts in the set for `_kycStatus`.
     */
    function getKycAccountsCount(IKyc.KycStatus _kycStatus) internal view returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = _kycStorage().kycAddressesByStatus[_kycStatus].length();
    }

    /**
     * @notice Returns a paginated slice of accounts under `_kycStatus` together with their stored
     *         `KycData`.
     * @dev Pagination uses the `Pagination` library on the `EnumerableSet`. Gas cost scales with
     *      `_pageLength` and the read of each `KycData` entry. For `GRANTED`, the returned page
     *      may include entries whose `validTo` has elapsed and are therefore no longer valid. To
     *      keep a clean list, expired entries must be explicitly removed via `revokeKyc`.
     * @param _kycStatus KYC status whose accounts are listed.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of accounts in the page.
     * @return accounts_ Page slice of addresses under `_kycStatus`.
     * @return kycData_ Parallel array of stored `KycData` entries for `accounts_`.
     */
    function getKycAccountsData(
        IKyc.KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory accounts_, IKyc.KycData[] memory kycData_) {
        accounts_ = _kycStorage().kycAddressesByStatus[_kycStatus].getFromSet(_pageIndex, _pageLength);

        uint256 totalAccounts = accounts_.length;
        kycData_ = new IKyc.KycData[](totalAccounts);

        for (uint256 index; index < totalAccounts; ) {
            kycData_[index] = getKycFor(accounts_[index]);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Reports whether `_account` satisfies `_kycStatus` according to the active checks.
     * @dev Internal KYC is bypassed when the activation flag is off; the external KYC list is
     *      always consulted. Uses `TimeTravelStorageWrapper.getBlockTimestamp` so test harnesses
     *      can manipulate the validity window.
     * @param _kycStatus Required KYC status.
     * @param _account Address being verified.
     * @return True when both internal (if active) and external checks recognise the status.
     */
    function verifyKycStatus(IKyc.KycStatus _kycStatus, address _account) internal view returns (bool) {
        bool internalKycValid = !_kycStorage().internalKycActivated ||
            getKycStatusFor(_account, TimeTravelStorageWrapper.getBlockTimestamp()) == _kycStatus;
        return internalKycValid && ExternalListManagementStorageWrapper.isExternallyGranted(_account, _kycStatus);
    }

    /**
     * @notice Reports whether the internal-KYC check is currently active.
     * @return True when internal KYC participates in `verifyKycStatus`.
     */
    function isInternalKycActivated() internal view returns (bool) {
        return _kycStorage().internalKycActivated;
    }

    /**
     * @notice Returns the storage pointer for the KYC namespace.
     * @dev Resolves the ERC-7201 slot via inline assembly to obtain a struct reference at
     *      `STORAGE_LOCATION_KYC`.
     * @return kyc_ Storage reference to the `KycStorage` struct.
     */
    function _kycStorage() private pure returns (KycStorage storage kyc_) {
        bytes32 position = STORAGE_LOCATION_KYC;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kyc_.slot := position
        }
    }
}
