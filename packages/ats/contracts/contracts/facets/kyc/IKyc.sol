// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Kyc
bytes32 constant RESOLVER_KEY_KYC = 0xf7fc316b28304fa0b62b8849c3c91a901e72894380ecf746c2bc13e5656549cd;

/**
 * @title IKyc Interface
 * @notice Interface for KYC (Know Your Customer) management operations
 * @dev Defines standard functions for granting, revoking, and checking KYC status
 * @author Hashgraph
 */
interface IKyc {
    enum KycStatus {
        NOT_GRANTED,
        GRANTED
    }

    struct KycData {
        uint256 validFrom;
        uint256 validTo;
        string vcId;
        address issuer;
        KycStatus status;
    }

    /**
     * @notice Emitted once when the KYC capability is initialised on a token.
     * @dev Fires exclusively from `initializeInternalKyc` after the storage write succeeds.
     * @param internalKycActivated Whether internal KYC enforcement was enabled at initialisation.
     */
    event KycInitialized(bool internalKycActivated);

    /**
     * @notice Emitted when KYC is granted to an account.
     * @param account The address for which the KYC is granted.
     * @param issuer The address of the issuer of the KYC.
     */
    event KycGranted(address indexed account, address indexed issuer);

    /**
     * @notice Emitted when the internal KYC enforcement status is toggled.
     * @param operator The address that triggered the status update.
     * @param activated The new activation state of the internal KYC.
     */
    event InternalKycStatusUpdated(address indexed operator, bool activated);

    /**
     * @notice Emitted when KYC is revoked from an account.
     * @param account The address for which the KYC is revoked.
     * @param issuer The address of the issuer revoking the KYC.
     */
    event KycRevoked(address indexed account, address indexed issuer);

    error InvalidKycStatus();
    error KycIsNotGranted();
    error InvalidZeroAddress();
    /**
     * @notice Initialises the internal KYC capability on the token.
     * @param _activateInternalKyc Whether to enable internal KYC enforcement immediately.
     */
    function initializeInternalKyc(bool _activateInternalKyc) external;

    /**
     * @notice Activates internal KYC enforcement for the token.
     * @return success_ True when the call succeeds without reverting.
     */
    function activateInternalKyc() external returns (bool success_);

    /**
     * @notice Deactivates internal KYC enforcement for the token.
     * @return success_ True when the call succeeds without reverting.
     */
    function deactivateInternalKyc() external returns (bool success_);

    /**
     * @notice Grants KYC to an account with the supplied verifiable-credential metadata.
     * @param _account User whose KYC is being granted.
     * @param _vcId Verifiable-credential identifier issued by the issuer.
     * @param _validFrom Start timestamp of the KYC validity period.
     * @param _validTo End timestamp of the KYC validity period.
     * @param _issuer Address of the entity issuing the KYC.
     * @return success_ True when the grant succeeds without reverting.
     */
    function grantKyc(
        address _account,
        string calldata _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) external returns (bool success_);

    /**
     * @notice Revokes the KYC previously granted to an account.
     * @param _account User whose KYC is being revoked.
     * @return success_ True when the revocation succeeds without reverting.
     */
    function revokeKyc(address _account) external returns (bool success_);

    /**
     * @notice Returns the current KYC status for an account.
     * @param _account The account to check.
     * @return kycStatus_ GRANTED or NOT_GRANTED.
     */
    function getKycStatusFor(address _account) external view returns (KycStatus kycStatus_);

    /**
     * @notice Returns all KYC metadata recorded for an account.
     * @param _account The account to query.
     * @return kyc_ The full `KycData` struct for that account.
     */
    function getKycFor(address _account) external view returns (KycData memory kyc_);

    /**
     * @notice Returns the number of accounts with a given KYC status.
     * @param _kycStatus The status to filter by: GRANTED or NOT_GRANTED.
     * @return kycAccountsCount_ The count of accounts matching the given status.
     */
    function getKycAccountsCount(KycStatus _kycStatus) external view returns (uint256 kycAccountsCount_);

    /**
     * @notice Returns whether internal KYC enforcement is currently active.
     * @return True if internal KYC is activated, false otherwise.
     */
    function isInternalKycActivated() external view returns (bool);

    /**
     * @notice Returns a paginated list of accounts and their KYC data for a given KYC status.
     * @param _kycStatus The status to filter by: GRANTED or NOT_GRANTED.
     * @param _pageIndex Zero-based page index; skips `_pageIndex * _pageLength` entries.
     * @param _pageLength Maximum number of entries to return per page.
     * @return accounts_ The accounts matching the given KYC status in the requested page.
     * @return kycData_ The KYC data records corresponding to each account in `accounts_`.
     */
    function getKycAccountsData(
        KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory accounts_, KycData[] memory kycData_);
}
