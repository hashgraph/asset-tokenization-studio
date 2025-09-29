// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IExternalControlListManagement {
    event ExternalControlListsUpdated(
        address indexed operator,
        address[] controlLists,
        bool[] actives
    );
    event AddedToExternalControlLists(
        address indexed operator,
        address controlList
    );
    event RemovedFromExternalControlLists(
        address indexed operator,
        address controlList
    );

    error ListedControlList(address controlList);

    error UnlistedControlList(address controlList);

    error ExternalControlListsNotUpdated(
        address[] controlLista,
        bool[] actives
    );

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalControlLists(
        address[] calldata _controlLists
    ) external;

    /**
     * @notice Updates the status of multiple external control lists
     */
    function updateExternalControlLists(
        address[] calldata _controlLists,
        bool[] calldata _actives
    ) external returns (bool success_);

    /**
     * @notice Adds a new external control list
     */
    function addExternalControlList(
        address _controlList
    ) external returns (bool success_);

    /**
     * @notice Removes existing control lists
     */
    function removeExternalControlList(
        address _controlList
    ) external returns (bool success_);

    /**
     * @notice Checks if an address is a listed external control list
     */
    function isExternalControlList(
        address _controlList
    ) external view returns (bool);

    /**
     * @notice Returns the number of listed external control lists
     */
    function getExternalControlListsCount()
        external
        view
        returns (uint256 externalControlListsCount_);

    /**
     * @notice Returns a paginated list of listed external control lists
     */
    function getExternalControlListsMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
