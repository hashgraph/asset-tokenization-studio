// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEIP712 } from "./IEIP712.sol";
import { EIP712 } from "./EIP712.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _EIP712_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  EIP712Facet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the EIP-712 domain separator via `IEIP712`,
 *         registered under `_EIP712_RESOLVER_KEY`.
 * @dev    Exposes one selector: `DOMAIN_SEPARATOR`.
 */
contract EIP712Facet is EIP712, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EIP712_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.DOMAIN_SEPARATOR.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IEIP712).interfaceId;
        }
    }
}
