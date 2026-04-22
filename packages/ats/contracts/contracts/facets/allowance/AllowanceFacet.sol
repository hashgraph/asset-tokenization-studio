// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAllowance } from "./IAllowance.sol";
import { Allowance } from "./Allowance.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ALLOWANCE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title AllowanceFacet
 * @notice Diamond facet for the Allowance domain. Registers the 4 selectors that define
 *         the ERC-20 allowance surface (`approve`, `increaseAllowance`, `decreaseAllowance`
 *         and `allowance`).
 */
contract AllowanceFacet is Allowance, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ALLOWANCE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.allowance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.decreaseAllowance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.increaseAllowance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.approve.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IAllowance).interfaceId;
    }
}
