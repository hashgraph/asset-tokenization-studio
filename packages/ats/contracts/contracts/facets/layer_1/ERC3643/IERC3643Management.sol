// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "./IERC3643Types.sol";

interface IERC3643Management is IERC3643Types {
    /**
     * @dev Facet initializer
     *
     * Sets the compliance contract address
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external;
}
