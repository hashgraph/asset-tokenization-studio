// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IInterestRate } from "./IInterestRate.sol";
import { InterestRate } from "./InterestRate.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _INTEREST_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title InterestRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the coupon rate type selector —
 *         `initialize_InterestRateType`, `setCouponRateType`, and `getCouponRateType` —
 *         under `_INTEREST_RATE_RESOLVER_KEY`.
 * @dev Inherits `InterestRate` for business logic and implements `IStaticFunctionSelectors`
 *      for Diamond proxy selector registration.
 */
contract InterestRateFacet is InterestRate, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _INTEREST_RATE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeInterestRateType.selector,
                this.getCouponRateType.selector,
                this.setCouponRateType.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IInterestRate).interfaceId);
    }
}
