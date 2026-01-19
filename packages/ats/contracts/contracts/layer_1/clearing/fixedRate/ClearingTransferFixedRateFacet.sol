// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingTransferFacetBase } from "../ClearingTransferFacetBase.sol";
import { _CLEARING_TRANSFER_FIXED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "contracts/layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ClearingTransferFixedRateFacet is ClearingTransferFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_TRANSFER_FIXED_RATE_RESOLVER_KEY;
    }
}
