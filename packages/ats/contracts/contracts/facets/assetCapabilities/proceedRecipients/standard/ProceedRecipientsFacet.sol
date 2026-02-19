// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProceedRecipientsFacetBase } from "../ProceedRecipientsFacetBase.sol";
import { _PROCEED_RECIPIENTS_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";

contract ProceedRecipientsFacet is ProceedRecipientsFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROCEED_RECIPIENTS_RESOLVER_KEY;
    }
}
