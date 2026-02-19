// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _TRANSFER_AND_LOCK_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/regulation.sol";
import { TransferAndLockFacetBase } from "../TransferAndLockFacetBase.sol";

contract TransferAndLockFixedRateFacet is TransferAndLockFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TRANSFER_AND_LOCK_FIXED_RATE_RESOLVER_KEY;
    }
}
