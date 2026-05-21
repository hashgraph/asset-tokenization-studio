// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBurn } from "./IBurn.sol";
import { Burn } from "./Burn.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _BURN_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BurnFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the ERC-1594 redemption and ERC-3643 burn surfaces,
 *         registered under `_BURN_RESOLVER_KEY`.
 * @dev Inherits burn logic from `Burn` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes three
 *      selectors: `burn`, `redeem` and `redeemFrom`.
 */
contract BurnFacet is Burn, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BURN_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeBurn.selector,
                this.burn.selector,
                this.redeem.selector,
                this.redeemFrom.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBurn).interfaceId);
    }
}
