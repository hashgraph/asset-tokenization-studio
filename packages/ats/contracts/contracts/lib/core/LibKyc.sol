// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycStorage, kycStorage, ExternalListDataStorage, externalListStorage } from "../../storage/CoreStorage.sol";
import { _KYC_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKyc } from "../../facets/features/interfaces/IKyc.sol";
import { IRevocationList } from "../../facets/features/interfaces/IRevocationList.sol";
import { IExternalKycList } from "../../facets/features/interfaces/IExternalKycList.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import { LibSSI } from "./LibSSI.sol";

/// @title LibKyc — Know Your Customer (KYC) management library
/// @notice Centralized KYC functionality including internal and external KYC verification
/// @dev Uses free function storage accessors from CoreStorage.sol and LibSSI for SSI queries
library LibKyc {
    using EnumerableSet for EnumerableSet.AddressSet;
    using LibPagination for EnumerableSet.AddressSet;

    function initializeInternalKyc(bool activated) internal {
        KycStorage storage ks = kycStorage();
        ks.initialized = true;
        ks.internalKycActivated = activated;
    }

    function setInternalKyc(bool activated) internal returns (bool) {
        kycStorage().internalKycActivated = activated;
        return true;
    }

    function grantKyc(
        address account,
        string memory vcId,
        uint256 validFrom,
        uint256 validTo,
        address issuer
    ) internal returns (bool) {
        KycStorage storage ks = kycStorage();
        ks.kyc[account] = IKyc.KycData(validFrom, validTo, vcId, issuer, IKyc.KycStatus.GRANTED);
        ks.kycAddressesByStatus[IKyc.KycStatus.GRANTED].add(account);
        return true;
    }

    function revokeKyc(address account) internal returns (bool) {
        KycStorage storage ks = kycStorage();
        delete ks.kyc[account];
        ks.kycAddressesByStatus[IKyc.KycStatus.GRANTED].remove(account);
        return true;
    }

    function getKycStatusFor(address account) internal view returns (IKyc.KycStatus) {
        IKyc.KycData memory kycFor = getKycFor(account);

        if (kycFor.validTo < block.timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (kycFor.validFrom > block.timestamp) return IKyc.KycStatus.NOT_GRANTED;
        if (!LibSSI.isIssuer(kycFor.issuer)) return IKyc.KycStatus.NOT_GRANTED;

        address revocationListAddress = LibSSI.getRevocationRegistryAddress();

        if (
            revocationListAddress != address(0) &&
            IRevocationList(revocationListAddress).revoked(kycFor.issuer, kycFor.vcId)
        ) return IKyc.KycStatus.NOT_GRANTED;

        return kycFor.status;
    }

    function getKycFor(address account) internal view returns (IKyc.KycData memory) {
        return kycStorage().kyc[account];
    }

    function getKycAccountsCount(IKyc.KycStatus status) internal view returns (uint256) {
        return kycStorage().kycAddressesByStatus[status].length();
    }

    function getKycAccountsData(
        IKyc.KycStatus status,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory accounts, IKyc.KycData[] memory kycData) {
        KycStorage storage ks = kycStorage();
        accounts = ks.kycAddressesByStatus[status].getFromSet(pageIndex, pageLength);

        uint256 totalAccounts = accounts.length;
        kycData = new IKyc.KycData[](totalAccounts);

        for (uint256 index; index < totalAccounts; ) {
            kycData[index] = getKycFor(accounts[index]);
            unchecked {
                ++index;
            }
        }
    }

    function verifyKycStatus(IKyc.KycStatus status, address account) internal view returns (bool) {
        KycStorage storage ks = kycStorage();
        bool internalKycValid = !ks.internalKycActivated || getKycStatusFor(account) == status;
        return internalKycValid && isExternallyGranted(account, status);
    }

    function requireValidKycStatus(IKyc.KycStatus status, address account) internal view {
        if (!verifyKycStatus(status, account)) revert IKyc.InvalidKycStatus();
    }

    function isInternalKycActivated() internal view returns (bool) {
        return kycStorage().internalKycActivated;
    }

    function isKycInitialized() internal view returns (bool) {
        return kycStorage().initialized;
    }

    function requireValidDates(uint256 validFrom, uint256 validTo) internal view {
        if (validFrom > validTo || validTo < block.timestamp) revert IKyc.InvalidDates();
    }

    function isExternallyGranted(address account, IKyc.KycStatus status) internal view returns (bool) {
        ExternalListDataStorage storage externalKycListStorage = externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION);
        uint256 length = externalKycListStorage.list.length();
        for (uint256 index; index < length; ) {
            if (IExternalKycList(externalKycListStorage.list.at(index)).getKycStatus(account) != status) return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }
}
