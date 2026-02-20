// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INonces } from "../interfaces/INonces.sol";
import { LibNonce } from "../../../lib/core/LibNonce.sol";

abstract contract Nonces is INonces {
    function nonces(address owner) external view override returns (uint256) {
        return LibNonce.getNonceFor(owner);
    }
}
