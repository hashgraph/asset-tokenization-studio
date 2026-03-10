// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INonces } from "./INonces.sol";
import { Internals } from "../../../domain/Internals.sol";

abstract contract Nonces is INonces, Internals {
    function nonces(address owner) external view returns (uint256) {
        return _getNonceFor(owner);
    }
}
