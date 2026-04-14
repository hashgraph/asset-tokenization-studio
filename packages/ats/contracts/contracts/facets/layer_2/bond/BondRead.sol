// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "./IBondRead.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { Modifiers } from "../../../services/Modifiers.sol";

abstract contract BondRead is IBondRead, TimestampProvider, Modifiers {
    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return BondStorageWrapper.getBondDetails();
    }
    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return BondStorageWrapper.getPrincipalFor(_account);
    }
}
