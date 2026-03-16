// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "./IBondRead.sol";
import { Internals } from "../../../domain/Internals.sol";

abstract contract BondRead is IBondRead, Internals {
    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return _getBondDetails();
    }

    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return _getPrincipalFor(_account);
    }
}
