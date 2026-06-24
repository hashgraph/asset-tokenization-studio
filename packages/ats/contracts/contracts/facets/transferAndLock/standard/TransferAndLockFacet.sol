// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_TRANSFER_AND_LOCK } from "../../IAsset.sol";

import { TransferAndLockFacetBase } from "../TransferAndLockFacetBase.sol";

contract TransferAndLockFacet is TransferAndLockFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_TRANSFER_AND_LOCK;
    }

    function _transferAndLockInitializerKey() internal pure override returns (bytes32) {
        return RESOLVER_KEY_TRANSFER_AND_LOCK;
    }
}
