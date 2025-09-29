// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ERC1643Facet} from '../../../layer_1/ERC1400/ERC1643/ERC1643Facet.sol';
import {
    TimeTravelStorageWrapper
} from '../timeTravel/TimeTravelStorageWrapper.sol';
import {LocalContext} from '../../../layer_0/context/LocalContext.sol';

contract ERC1643FacetTimeTravel is ERC1643Facet, TimeTravelStorageWrapper {
    function _blockTimestamp()
        internal
        view
        override(LocalContext, TimeTravelStorageWrapper)
        returns (uint256)
    {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber()
        internal
        view
        override(LocalContext, TimeTravelStorageWrapper)
        returns (uint256)
    {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
