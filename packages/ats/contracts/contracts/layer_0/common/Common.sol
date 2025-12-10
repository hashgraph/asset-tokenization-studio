// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../constants/roles.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";
import { KpisStorageWrapper } from "../kpis/KpisStorageWrapper.sol";

abstract contract Common is KpisStorageWrapper {
    error AlreadyInitialized();
    error OnlyDelegateAllowed();

    modifier onlyUninitialized(bool _initialized) {
        _checkUninitialized(_initialized);
        _;
    }

    modifier onlyDelegate() {
        _checkDelegate();
        _;
    }

    modifier onlyUnProtectedPartitionsOrWildCardRole() {
        _checkUnProtectedPartitionsOrWildCardRole();
        _;
    }

    modifier onlyClearingDisabled() {
        _checkClearingDisabled();
        _;
    }

    function _checkUnProtectedPartitionsOrWildCardRole() internal view {
        if (_arePartitionsProtected() && !_hasRole(_WILD_CARD_ROLE, _msgSender())) {
            revert PartitionsAreProtectedAndNoRole(_msgSender(), _WILD_CARD_ROLE);
        }
    }

    function _checkDelegate() private view {
        if (_msgSender() != address(this)) revert OnlyDelegateAllowed();
    }

    function _checkClearingDisabled() private view {
        if (_isClearingActivated()) {
            revert IClearing.ClearingIsActivated();
        }
    }

    function _checkUninitialized(bool _initialized) private pure {
        if (_initialized) revert AlreadyInitialized();
    }
}
