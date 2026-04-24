// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1594 } from "./IERC1594.sol";
import { ERC1594 } from "./ERC1594.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC1594_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

/**
 * @title ERC1594Facet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the ERC-1594 issuance and redemption surface.
 * @dev Registers five selectors: `initialize_ERC1594`, `transferWithData`, `transferFromWithData`,
 *      `redeem` and `redeemFrom`. Business logic lives in the `ERC1594` abstract contract.
 */
contract ERC1594Facet is ERC1594, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1594_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 5;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.redeemFrom.selector;
            staticFunctionSelectors_[--selectorIndex] = this.redeem.selector;
            staticFunctionSelectors_[--selectorIndex] = this.transferFromWithData.selector;
            staticFunctionSelectors_[--selectorIndex] = this.transferWithData.selector;
            staticFunctionSelectors_[--selectorIndex] = this.initialize_ERC1594.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1594).interfaceId;
    }
}
