// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IControlList {
    /**
     * @dev Emitted when an account is added to the controllist
     *
     * @param account The account that was added to the controllist
     * @param operator The caller of the function that emitted the event
     */
    event AddedToControlList(address indexed operator, address indexed account);

    /**
     * @dev Emitted when an account is removed from the controllist
     *
     * @param account The account that was removed from the controllist
     * @param operator The caller of the function that emitted the event
     */
    event RemovedFromControlList(
        address indexed operator,
        address indexed account
    );

    error ListedAccount(address account);
    error UnlistedAccount(address account);

    /**
     * @dev Initial configuration
     *
     * @param _isWhiteList true (WHITELIST) false (BLACKLIST)
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ControlList(bool _isWhiteList) external;

    /**
     * @dev Adds an account to the control list
     *
     * @param _account account address
     * @return success_ true or false
     */
    function addToControlList(
        address _account
    ) external returns (bool success_);

    /**
     * @dev Remove an account from the control list
     *
     * @param _account account address
     * @return success_ true or false
     */
    function removeFromControlList(
        address _account
    ) external returns (bool success_);

    /**
     * @dev Checks if an account is in the control list
     *
     * @param _account the account address
     * @return bool true or false
     */
    function isInControlList(address _account) external view returns (bool);

    /**
     * @dev Returns the control list type
     *
     * @return bool true (WHITELIST) false (BLACKLIST)
     */
    function getControlListType() external view returns (bool);

    /**
     * @dev Returns the number of members the control list currently has
     *
     * @return controlListCount_ The number of members
     */
    function getControlListCount()
        external
        view
        returns (uint256 controlListCount_);

    /**
     * @dev Returns an array of members the controllist currently has
     *
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return members_ The array containing the members addresses
     */
    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);
}
