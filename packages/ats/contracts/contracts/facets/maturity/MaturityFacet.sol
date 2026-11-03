// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity, RESOLVER_KEY_MATURITY } from "./IMaturity.sol";
import { Maturity } from "./Maturity.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title  MaturityFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes token maturity initialisation, redemption, and maturity date
 *         management via `IMaturity`, registered under `RESOLVER_KEY_MATURITY`.
 * @dev    Inherits maturity logic from `Maturity` and satisfies `IStaticFunctionSelectors` for
 *         Diamond proxy selector registration. Exposes four selectors:
 *         `initializeMaturity`, `fullRedeemAtMaturity`, `updateMaturityDate`, and `getMaturityDate`.
 */
contract MaturityFacet is Maturity, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_MATURITY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeMaturity.selector,
                this.fullRedeemAtMaturity.selector,
                this.redeemAtMaturityByPartitionRange.selector,
                this.updateMaturityDate.selector,
                this.getMaturityDate.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IMaturity).interfaceId);
    }
}
