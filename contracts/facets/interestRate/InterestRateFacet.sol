// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IInterestRate, RESOLVER_KEY_INTEREST_RATE } from "./IInterestRate.sol";
import { InterestRate } from "./InterestRate.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title InterestRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the coupon rate type selector —
 *         `initialize_InterestRateType`, `setCouponRateType`, and `getCouponRateType` —
 *         under `RESOLVER_KEY_INTEREST_RATE`.
 * @dev Inherits `InterestRate` for business logic and implements `IStaticFunctionSelectors`
 *      for Diamond proxy selector registration.
 */
contract InterestRateFacet is InterestRate, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_INTEREST_RATE;
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
