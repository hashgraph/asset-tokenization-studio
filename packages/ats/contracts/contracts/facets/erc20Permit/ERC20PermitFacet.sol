// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit, RESOLVER_KEY_ERC20PERMIT } from "./IERC20Permit.sol";
import { ERC20Permit } from "./ERC20Permit.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title ERC20PermitFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing ERC-2612 permit-based gasless approval operations,
 *         registered under `RESOLVER_KEY_ERC20PERMIT`.
 */
contract ERC20PermitFacet is ERC20Permit, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_ERC20PERMIT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeERC20Permit.selector, this.permit.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IERC20Permit).interfaceId);
    }
}
