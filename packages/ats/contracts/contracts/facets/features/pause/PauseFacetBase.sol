// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "../interfaces/pause/IPause.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _PAUSER_ROLE } from "../../../constants/roles.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";

abstract contract PauseFacetBase is IPause, IStaticFunctionSelectors {
    function pause() external override returns (bool success_) {
        LibAccess.checkRole(_PAUSER_ROLE);
        LibPause.requireNotPaused();
        LibPause.pause();
        success_ = true;
    }

    function unpause() external override returns (bool success_) {
        LibAccess.checkRole(_PAUSER_ROLE);
        LibPause.requirePaused();
        LibPause.unpause();
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return LibPause.isPaused();
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.pause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unpause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isPaused.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IPause).interfaceId;
    }
}
