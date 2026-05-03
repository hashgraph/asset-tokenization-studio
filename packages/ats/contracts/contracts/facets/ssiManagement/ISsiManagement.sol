// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ISsiManagement
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing Self-Sovereign Identity (SSI) configuration on a security token,
 *         including a list of trusted credential issuers and the address of the revocation registry
 *         contract.
 * @dev Part of the Diamond facet system. `SSI_MANAGER_ROLE` is required for all state-mutating
 *      functions. Issuer and revocation data are persisted in diamond storage via
 *      `SsiManagementStorageWrapper`.
 */
interface ISsiManagement {
    /**
     * @notice Emitted when the revocation registry address is updated.
     * @param oldRegistryAddress Previous revocation registry contract address.
     * @param newRegistryAddress New revocation registry contract address.
     */
    event RevocationRegistryUpdated(address indexed oldRegistryAddress, address indexed newRegistryAddress);

    /**
     * @notice Emitted when an issuer is added to the trusted issuer list.
     * @param operator Address of the caller who performed the addition.
     * @param issuer Address of the issuer that was added.
     */
    event AddedToIssuerList(address indexed operator, address indexed issuer);

    /**
     * @notice Emitted when an issuer is removed from the trusted issuer list.
     * @param operator Address of the caller who performed the removal.
     * @param issuer Address of the issuer that was removed.
     */
    event RemovedFromIssuerList(address indexed operator, address indexed issuer);

    /**
     * @notice Thrown when attempting to add an address already present in the issuer list.
     * @param issuer The duplicate issuer address.
     */
    error ListedIssuer(address issuer);

    /**
     * @notice Thrown when attempting to remove an address not present in the issuer list.
     * @param issuer The unlisted issuer address.
     */
    error UnlistedIssuer(address issuer);

    /**
     * @notice Thrown when an address is required to be a listed issuer but is not.
     * @param issuer The address that failed the issuer membership check.
     */
    error AccountIsNotIssuer(address issuer);

    /**
     * @notice Sets the address of the revocation registry contract used for SSI credential
     *         validation.
     * @dev Requires `SSI_MANAGER_ROLE` and the token to be unpaused. Emits
     *      `RevocationRegistryUpdated`.
     * @param _revocationRegistryAddress New revocation registry contract address.
     * @return success_ True if the address was updated successfully.
     */
    function setRevocationRegistryAddress(address _revocationRegistryAddress) external returns (bool success_);

    /**
     * @notice Adds an address to the trusted issuer list.
     * @dev Requires `SSI_MANAGER_ROLE` and the token to be unpaused. Reverts with `ListedIssuer`
     *      if the address is already listed. Emits `AddedToIssuerList`.
     * @param _issuer Address of the issuer to add.
     * @return success_ True if the issuer was added successfully.
     */
    function addIssuer(address _issuer) external returns (bool success_);

    /**
     * @notice Removes an address from the trusted issuer list.
     * @dev Requires `SSI_MANAGER_ROLE` and the token to be unpaused. Reverts with `UnlistedIssuer`
     *      if the address is not listed. Emits `RemovedFromIssuerList`.
     * @param _issuer Address of the issuer to remove.
     * @return success_ True if the issuer was removed successfully.
     */
    function removeIssuer(address _issuer) external returns (bool success_);

    /**
     * @notice Returns the address of the current revocation registry contract.
     * @return revocationRegistryAddress_ The revocation registry contract address.
     */
    function getRevocationRegistryAddress() external view returns (address revocationRegistryAddress_);

    /**
     * @notice Checks whether an address is present in the trusted issuer list.
     * @param _issuer Address to check.
     * @return True if the address is a listed issuer, false otherwise.
     */
    function isIssuer(address _issuer) external view returns (bool);

    /**
     * @notice Returns the total number of addresses in the trusted issuer list.
     * @return issuerListCount_ The current number of listed issuers.
     */
    function getIssuerListCount() external view returns (uint256 issuerListCount_);

    /**
     * @notice Returns a paginated slice of the trusted issuer list.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the list length.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return members_ Array of issuer addresses for the requested page.
     */
    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
