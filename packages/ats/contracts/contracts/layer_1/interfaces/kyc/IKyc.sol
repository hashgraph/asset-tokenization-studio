// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IKyc {
    struct KycData {
        uint256 validFrom;
        uint256 validTo;
        string vcId;
        address issuer;
        KycStatus status;
    }

    enum KycStatus {
        NOT_GRANTED,
        GRANTED
    }

    /**
     * @dev Emitted when a Kyc is granted
     *
     * @param account The address for which the Kyc is granted
     * @param issuer The address of the issuer of the Kyc
     */
    event KycGranted(address indexed account, address indexed issuer);

    /**
     * @dev Emitted when Internal Kyc is updated
     *
     * @param operator The address for which the Kyc is updated
     * @param activated The status of the internal Kyc
     */
    event InternalKycStatusUpdated(address indexed operator, bool activated);

    /**
     * @dev Emitted when a Kyc is revoked
     *
     * @param account The address for which the Kyc is revoked
     * @param issuer The address of the issuer of the Kyc
     */
    event KycRevoked(address indexed account, address indexed issuer);

    error InvalidDates();
    error InvalidKycStatus();
    error KycIsNotGranted();
    error InvalidZeroAddress();

    /**
     * @dev Initialize Internal Kyc
     */
    function initializeInternalKyc(bool _activateInternalKyc) external;

    /**
     * @dev Activate Internal Kyc
     * @return success_ true or false
     */
    function activateInternalKyc() external returns (bool success_);

    /**
     * @dev Deactivate Internal Kyc
     * @return success_ true or false
     */
    function deactivateInternalKyc() external returns (bool success_);

    /**
     * @dev Grant kyc to an address
     *
     * @param _account user whose Kyc is being granted
     * @param _vcId credential Id
     * @param _validFrom start date of the Kyc
     * @param _validTo end date of the Kyc
     * @param _issuer issurer of the Kyc
     * @return success_ true or false
     */
    function grantKyc(
        address _account,
        string memory _vcId,
        uint256 _validFrom,
        uint256 _validTo,
        address _issuer
    ) external returns (bool success_);

    /**
     * @dev Revoke kyc to an address
     *
     * @param _account user whose Kyc is being revoked
     * @return success_ true or false
     */
    function revokeKyc(address _account) external returns (bool success_);

    /**
     * @dev Get the status of the Kyc for an account
     *
     * @param _account the account to check
     * @return kycStatus_ GRANTED or NOT_GRANTED
     */
    function getKycStatusFor(
        address _account
    ) external view returns (KycStatus kycStatus_);

    /**
     * @dev Get all the info of the Kyc for an account
     *
     * @param _account the account to check
     * @return kyc_
     */
    function getKycFor(
        address _account
    ) external view returns (KycData memory kyc_);

    /**
     * @dev Get the count of accounts with a given Kyc status
     *
     * @param _kycStatus GRANTED or NOT_GRANTED
     * @return kycAccountsCount_ count of accounts with the given Kyc status
     */
    function getKycAccountsCount(
        KycStatus _kycStatus
    ) external view returns (uint256 kycAccountsCount_);

    /**
     * @dev Get the internal kyc flag
     *
     * @return bool true if the internal kyc is activated
     */
    function isInternalKycActivated() external view returns (bool);

    /**
     * @dev Returns an array with the KYC data from accounts with a given KYC status
     *
     * @param _kycStatus GRANTED or NOT_GRANTED
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return accounts_ The array containing the accounts
     * @return kycData_ The array containing the data from the accounts
     */
    function getKycAccountsData(
        KycStatus _kycStatus,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (address[] memory accounts_, KycData[] memory kycData_);
}
