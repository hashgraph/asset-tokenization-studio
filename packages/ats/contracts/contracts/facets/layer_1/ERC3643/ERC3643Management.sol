// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Management } from "./IERC3643Management.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";

abstract contract ERC3643Management is IERC3643Management, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external onlyNotERC3643Initialized {
        ERC3643StorageWrapper.initialize_ERC3643(_compliance, _identityRegistry);
    }
}
