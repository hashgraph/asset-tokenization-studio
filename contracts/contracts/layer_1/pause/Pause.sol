pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IPause} from '../interfaces/pause/IPause.sol';
import {_PAUSER_ROLE} from '../constants/roles.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_PAUSE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {Common} from '../common/Common.sol';

contract Pause is IPause, IStaticFunctionSelectors, Common {
    function pause()
        external
        virtual
        override
        onlyRole(_PAUSER_ROLE)
        onlyUnpaused
        returns (bool success_)
    {
        _setPause(true);
        success_ = true;
    }

    function unpause()
        external
        virtual
        override
        onlyRole(_PAUSER_ROLE)
        onlyPaused
        returns (bool success_)
    {
        _setPause(false);
        success_ = true;
    }

    function isPaused() external view virtual override returns (bool) {
        return _isPaused();
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _PAUSE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.pause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unpause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isPaused.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IPause).interfaceId;
    }
}
