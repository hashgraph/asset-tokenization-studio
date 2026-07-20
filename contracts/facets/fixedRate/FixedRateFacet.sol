// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IFixedRate, RESOLVER_KEY_FIXED_RATE } from "./IFixedRate.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { FixedRate } from "./FixedRate.sol";

/**
 * @title  FixedRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes fixed-rate management to the proxy.
 * @dev    Selectors exposed:
 *         - `initializeFixedRate`
 *         - `setRate`
 *         - `getRate`
 */
contract FixedRateFacet is FixedRate, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_FIXED_RATE;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeFixedRate.selector, this.setRate.selector, this.getRate.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFixedRate).interfaceId);
    }
}
