// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAllowance } from "./IAllowance.sol";
import { Allowance } from "./Allowance.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeAllowance.selector,
                this.approve.selector,
                this.increaseAllowance.selector,
                this.decreaseAllowance.selector,
                this.allowance.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IAllowance).interfaceId);
    }
}
