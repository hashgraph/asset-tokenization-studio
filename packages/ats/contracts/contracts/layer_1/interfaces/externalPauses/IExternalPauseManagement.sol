// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IExternalPauseManagement {
    event ExternalPausesUpdated(
        address indexed operator,
        address[] pauses,
        bool[] actives
    );
    event AddedToExternalPauses(address indexed operator, address pause);
    event RemovedFromExternalPauses(address indexed operator, address pause);

    error ListedPause(address pause);

    error UnlistedPause(address pause);

    error ExternalPausesNotUpdated(address[] pauses, bool[] actives);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalPauses(address[] calldata _pauses) external;

    /**
     * @notice Updates the status of multiple external pauses
     */
    function updateExternalPauses(
        address[] calldata _pauses,
        bool[] calldata _actives
    ) external returns (bool success_);

    /**
     * @notice Adds a new external pause
     */
    function addExternalPause(address _pause) external returns (bool success_);

    /**
     * @notice Removes existing external pauses
     */
    function removeExternalPause(
        address _pause
    ) external returns (bool success_);

    /**
     * @notice Checks if an address is a listed external pause
     */
    function isExternalPause(address _pause) external view returns (bool);

    /**
     * @notice Returns the number of listed external pauses
     */
    function getExternalPausesCount()
        external
        view
        returns (uint256 externalPausesCount_);

    /**
     * @notice Returns a paginated list of listed external pauses
     */
    function getExternalPausesMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
