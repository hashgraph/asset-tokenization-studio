// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurity } from "./ISecurity.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";

abstract contract Security is ISecurity {
    function getSecurityRegulationData()
        external
        pure
        override
        returns (SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = SecurityStorageWrapper.getSecurityRegulationData();
    }
}
