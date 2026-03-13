// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurity } from "./ISecurity.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";

abstract contract Security is ISecurity {
    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return ERC1410StorageWrapper._getTokenHolders(_pageIndex, _pageLength);
    }

    function getTotalSecurityHolders() external view returns (uint256) {
        return ERC1410StorageWrapper._getTotalTokenHolders();
    }

    function getSecurityRegulationData()
        external
        pure
        override
        returns (SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = SecurityStorageWrapper._getSecurityRegulationData();
    }
}
