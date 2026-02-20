// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControlList } from "../interfaces/controlList/IControlList.sol";
import { LibControlList } from "../../../lib/core/LibControlList.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { _CONTROL_LIST_ROLE } from "../../../constants/roles.sol";

/**
 * @title ControlList
 * @notice Business logic for control list management (whitelist/blacklist)
 */
abstract contract ControlList is IControlList {
    // ════════════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ════════════════════════════════════════════════════════════════════════════════════

    error AlreadyInitialized();

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Initialize the control list with whitelist or blacklist mode
     * @param _isWhiteList true for whitelist mode, false for blacklist mode
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ControlList(bool _isWhiteList) external override {
        if (LibControlList.isControlListInitialized()) {
            revert AlreadyInitialized();
        }
        LibControlList.initializeControlList(_isWhiteList);
    }

    /**
     * @notice Add an account to the control list
     * @param _account The account to add
     * @return success_ True if the account was successfully added
     */
    function addToControlList(address _account) external override returns (bool success_) {
        LibAccess.checkRole(_CONTROL_LIST_ROLE);
        LibPause.requireNotPaused();

        success_ = LibControlList.addToControlList(_account);
        if (!success_) {
            revert ListedAccount(_account);
        }
        emit AddedToControlList(msg.sender, _account);
    }

    /**
     * @notice Remove an account from the control list
     * @param _account The account to remove
     * @return success_ True if the account was successfully removed
     */
    function removeFromControlList(address _account) external override returns (bool success_) {
        LibAccess.checkRole(_CONTROL_LIST_ROLE);
        LibPause.requireNotPaused();

        success_ = LibControlList.removeFromControlList(_account);
        if (!success_) {
            revert UnlistedAccount(_account);
        }
        emit RemovedFromControlList(msg.sender, _account);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Check if an account is in the control list
     * @param _account The account to check
     * @return True if the account is in the control list
     */
    function isInControlList(address _account) external view override returns (bool) {
        return LibControlList.isInControlList(_account);
    }

    /**
     * @notice Get the control list type
     * @return True for whitelist mode, false for blacklist mode
     */
    function getControlListType() external view override returns (bool) {
        return LibControlList.getControlListType();
    }

    /**
     * @notice Get the number of accounts in the control list
     * @return controlListCount_ The number of accounts
     */
    function getControlListCount() external view override returns (uint256 controlListCount_) {
        controlListCount_ = LibControlList.getControlListCount();
    }

    /**
     * @notice Get a paginated list of accounts in the control list
     * @param _pageIndex The page index (0-based)
     * @param _pageLength The number of accounts per page
     * @return members_ The array of account addresses
     */
    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = LibControlList.getControlListMembers(_pageIndex, _pageLength);
    }
}
