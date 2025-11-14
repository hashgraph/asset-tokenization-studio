// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurity } from "../interfaces/ISecurity.sol";
import { Common } from "../../layer_1/common/Common.sol";

abstract contract Security is ISecurity, Common {
    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function getTotalSecurityHolders() external view returns (uint256) {
        return _getTotalTokenHolders();
    }

    function getSecurityRegulationData()
        external
        pure
        override
        returns (SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = _getSecurityRegulationData();
    }
}
