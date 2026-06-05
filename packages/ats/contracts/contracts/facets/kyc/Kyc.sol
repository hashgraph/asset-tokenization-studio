// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_KYC, ROLE_INTERNAL_KYC_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { IKyc, RESOLVER_KEY_KYC } from "./IKyc.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { KycStorageWrapper } from "../../domain/core/KycStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Kyc
 * @notice Manages internal KYC records and exposes paginated KYC status queries.
 * @dev Implements `IKyc` and delegates persistent state to `KycStorageWrapper`.
 *      Mutating operations require the token to be operational, activated and unpaused, except
 *      initialisation, which is restricted to an unregistered facet. Time-dependent status checks
 *      use `EvmAccessors` as the canonical timestamp source.
 * @author Asset Tokenization Studio Team
 */
abstract contract Kyc is IKyc, Modifiers {
    /// @inheritdoc IKyc
    function initializeInternalKyc(
        bool _internalKycActivated
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_KYC) {
        KycStorageWrapper.initializeInternalKyc(_internalKycActivated);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_KYC);
        emit IKyc.KycInitialized(_internalKycActivated);
    }

    /// @inheritdoc IKyc
    function activateInternalKyc()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_INTERNAL_KYC_MANAGER)
        returns (bool success_)
    {
        success_ = KycStorageWrapper.setInternalKyc(true);
        emit InternalKycStatusUpdated(EvmAccessors.getMsgSender(), true);
    }

    /// @inheritdoc IKyc
    function deactivateInternalKyc()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_INTERNAL_KYC_MANAGER)
        returns (bool success_)
    {
        success_ = KycStorageWrapper.setInternalKyc(false);
        emit InternalKycStatusUpdated(EvmAccessors.getMsgSender(), false);
    }

    /// @inheritdoc IKyc
    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    )
        external
        virtual
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_KYC)
        validateAddressNotZero(_account)
        onlyValidKycStatus(KycStatus.NOT_GRANTED, _account)
        onlyThreeValidDates(_validFrom, _validTo, EvmAccessors.getBlockTimestamp())
        onlyValidIssuer(_issuer)
        returns (bool success_)
    {
        success_ = KycStorageWrapper.grantKyc(_account, _vcId, _validFrom, _validTo, _issuer);
        emit KycGranted(_account, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc IKyc
    function revokeKyc(
        address _account
    )
        external
        virtual
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_KYC)
        validateAddressNotZero(_account)
        returns (bool success_)
    {
        success_ = KycStorageWrapper.revokeKyc(_account);
        emit KycRevoked(_account, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc IKyc
    function getKycStatusFor(address _account) external view virtual override returns (KycStatus kycStatus_) {
        kycStatus_ = KycStorageWrapper.getKycStatusFor(_account, EvmAccessors.getBlockTimestamp());
    }

    /// @inheritdoc IKyc
    function getKycFor(address _account) external view virtual override returns (KycData memory kyc_) {
        kyc_ = KycStorageWrapper.getKycFor(_account);
    }

    /// @inheritdoc IKyc
    function getKycAccountsCount(
        KycStatus _kycStatus
    ) external view virtual override returns (uint256 kycAccountsCount_) {
        kycAccountsCount_ = KycStorageWrapper.getKycAccountsCount(_kycStatus);
    }

    /// @inheritdoc IKyc
    function getKycAccountsData(
        KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (address[] memory accounts_, KycData[] memory kycData_) {
        (accounts_, kycData_) = KycStorageWrapper.getKycAccountsData(_kycStatus, _pageIndex, _pageLength);
    }

    /// @inheritdoc IKyc
    function isInternalKycActivated() external view virtual override returns (bool) {
        return KycStorageWrapper.isInternalKycActivated();
    }
}
