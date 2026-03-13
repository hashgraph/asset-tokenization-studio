// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INonces } from "./INonces.sol";
import { NonceStorageWrapper } from "../../../domain/core/NonceStorageWrapper.sol";

abstract contract Nonces is INonces {
    function nonces(address owner) external view returns (uint256) {
        return NonceStorageWrapper._getNonceFor(owner);
    }
}
