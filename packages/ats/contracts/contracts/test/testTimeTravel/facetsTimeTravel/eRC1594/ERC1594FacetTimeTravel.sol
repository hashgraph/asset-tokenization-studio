// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC1594Facet } from "../../../../facets/features/ERC1400/ERC1594/ERC1594Facet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC1594FacetTimeTravel is ERC1594Facet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
