// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity } from "./IMaturity.sol";
import { Maturity } from "./Maturity.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _MATURITY_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  MaturityFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes bond maturity redemption and maturity date management via
 *         `IMaturity`, registered under `_MATURITY_RESOLVER_KEY`.
 * @dev    Inherits maturity logic from `Maturity` and satisfies `IStaticFunctionSelectors` for
 *         Diamond proxy selector registration. Exposes two selectors:
 *         `fullRedeemAtMaturity` and `updateMaturityDate`.
 */
contract MaturityFacet is Maturity, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MATURITY_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.updateMaturityDate.selector;
            staticFunctionSelectors_[--selectorIndex] = this.fullRedeemAtMaturity.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IMaturity).interfaceId;
        }
    }
}
