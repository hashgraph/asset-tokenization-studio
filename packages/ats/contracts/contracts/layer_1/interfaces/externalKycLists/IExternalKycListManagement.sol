// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IKyc} from '../kyc/IKyc.sol';

interface IExternalKycListManagement {
    event ExternalKycListsUpdated(
        address indexed operator,
        address[] kycLists,
        bool[] actives
    );
    event AddedToExternalKycLists(address indexed operator, address kycList);
    event RemovedFromExternalKycLists(
        address indexed operator,
        address kycList
    );

    error ListedKycList(address kycList);

    error UnlistedKycList(address kycList);

    error ExternalKycListsNotUpdated(address[] kycList, bool[] actives);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalKycLists(address[] calldata _kycLists) external;

    /**
     * @notice Updates the status of multiple external kyc lists
     */
    function updateExternalKycLists(
        address[] calldata _kycLists,
        bool[] calldata _actives
    ) external returns (bool success_);

    /**
     * @notice Adds a new external kyc list
     */
    function addExternalKycList(
        address _kycList
    ) external returns (bool success_);

    /**
     * @notice Removes existing kyc lists
     */
    function removeExternalKycList(
        address _kycList
    ) external returns (bool success_);

    /**
     * @notice Checks if an address is a listed external kyc list
     */
    function isExternalKycList(address _kycList) external view returns (bool);

    /**
     * @notice Queries the KYC status of the user in all the listed external KYC lists
     */
    function isExternallyGranted(
        address _account,
        IKyc.KycStatus _kycStatus
    ) external view returns (bool);

    /**
     * @notice Returns the number of listed external kyc lists
     */
    function getExternalKycListsCount()
        external
        view
        returns (uint256 externalKycListsCount_);

    /**
     * @notice Returns a paginated list of listed external kyc lists
     */
    function getExternalKycListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
