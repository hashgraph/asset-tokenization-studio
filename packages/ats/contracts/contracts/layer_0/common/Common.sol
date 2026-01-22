// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../constants/roles.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";
import { SecurityStorageWrapper } from "../security/SecurityStorageWrapper.sol";

abstract contract Common is SecurityStorageWrapper {
    error AlreadyInitialized();

    modifier onlyUninitialized(bool _initialized) override {
        _checkUninitialized(_initialized);
        _;
    }

    modifier onlyUnProtectedPartitionsOrWildCardRole() override {
        _checkUnProtectedPartitionsOrWildCardRole();
        _;
    }

    modifier onlyClearingDisabled() override {
        _checkClearingDisabled();
        _;
    }

    function _checkUnProtectedPartitionsOrWildCardRole() internal view override {
        if (_arePartitionsProtected() && !_hasRole(_WILD_CARD_ROLE, _msgSender())) {
            revert PartitionsAreProtectedAndNoRole(_msgSender(), _WILD_CARD_ROLE);
        }
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
