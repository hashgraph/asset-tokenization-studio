// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IControlList } from "../interfaces/controlList/IControlList.sol";
import { IControlListStorageWrapper } from "../interfaces/controlList/IControlListStorageWrapper.sol";
import { LibControlList } from "../../../lib/core/LibControlList.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { _CONTROL_LIST_ROLE } from "../../../constants/roles.sol";

abstract contract ControlListFacetBase is IControlList, IControlListStorageWrapper, IStaticFunctionSelectors {
    // ════════════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ════════════════════════════════════════════════════════════════════════════════════

    error AlreadyInitialized();

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ControlList(bool _isWhiteList) external override {
        if (LibControlList.isControlListInitialized()) {
            revert AlreadyInitialized();
        }
        LibControlList.initializeControlList(_isWhiteList);
    }

    function addToControlList(address _account) external override returns (bool success_) {
        LibAccess.checkRole(_CONTROL_LIST_ROLE);
        LibPause.requireNotPaused();

        success_ = LibControlList.addToControlList(_account);
        if (!success_) {
            revert ListedAccount(_account);
        }
        emit AddedToControlList(msg.sender, _account);
    }

    function removeFromControlList(address _account) external override returns (bool success_) {
        LibAccess.checkRole(_CONTROL_LIST_ROLE);
        LibPause.requireNotPaused();

        success_ = LibControlList.removeFromControlList(_account);
        if (!success_) {
            revert UnlistedAccount(_account);
        }
        emit RemovedFromControlList(msg.sender, _account);
    }

    function getControlListType() external view override returns (bool) {
        return LibControlList.getControlListType();
    }

    function isInControlList(address _account) external view override returns (bool) {
        return LibControlList.isInControlList(_account);
    }

    function getControlListCount() external view override returns (uint256 controlListCount_) {
        controlListCount_ = LibControlList.getControlListCount();
    }

    function getControlListMembers(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = LibControlList.getControlListMembers(_pageIndex, _pageLength);
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addToControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeFromControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isInControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListMembers.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IControlList).interfaceId;
    }
}
