// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ISsiManagement {
    /**
     * @dev Emitted when the revocation registry address is updated
     *
     * @param oldRegistryAddress previous revocation list address
     * @param newRegistryAddress new revocation list address
     */
    event RevocationRegistryUpdated(address indexed oldRegistryAddress, address indexed newRegistryAddress);

    /**
     * @dev Emitted when an issuer is added to the issuerlist
     *
     * @param issuer The issuer that was added to the issuerlist
     * @param operator The caller of the function that emitted the event
     */
    event AddedToIssuerList(address indexed operator, address indexed issuer);

    /**
     * @dev Emitted when an issuer is removed from the issuerlist
     *
     * @param issuer The issuer that was removed from the issuerlist
     * @param operator The caller of the function that emitted the event
     */
    event RemovedFromIssuerList(address indexed operator, address indexed issuer);

    error ListedIssuer(address issuer);
    error UnlistedIssuer(address issuer);
    error AccountIsNotIssuer(address issuer);

    /**
     * @dev Updates the revocation registry address
     *
     * @param _revocationRegistryAddress revocation list address
     * @return success_ true or false
     */
    function setRevocationRegistryAddress(address _revocationRegistryAddress) external returns (bool success_);

    /**
     * @dev Adds an issuer to the issuer list
     *
     * @param _issuer issuer address
     * @return success_ true or false
     */
    function addIssuer(address _issuer) external returns (bool success_);

    /**
     * @dev Remove an issuer from the issuer list
     *
     * @param _issuer issuer address
     * @return success_ true or false
     */
    function removeIssuer(address _issuer) external returns (bool success_);

    /**
     * @dev returns the revocation registry address
     *
     * @return revocationRegistryAddress_
     */
    function getRevocationRegistryAddress() external view returns (address revocationRegistryAddress_);

    /**
     * @dev Checks if an issuer is in the issuer list
     *
     * @param _issuer the issuer address
     * @return bool true or false
     */
    function isIssuer(address _issuer) external view returns (bool);

    /**
     * @dev Returns the number of members the issuer list currently has
     *
     * @return issuerListCount_ The number of members
     */
    function getIssuerListCount() external view returns (uint256 issuerListCount_);

    /**
     * @dev Returns an array of members the issuerlist currently has
     *
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return members_ The array containing the members addresses
     */
    function getIssuerListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
