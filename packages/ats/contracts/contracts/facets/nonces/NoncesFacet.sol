// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INonces } from "./INonces.sol";
import { Nonces } from "./Nonces.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _NONCES_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title NoncesFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes per-account nonce reads as a selectable proxy function.
 * @dev Inherits `Nonces` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `_NONCES_RESOLVER_KEY` identifies this
 *      facet within the diamond proxy.
 */
contract NoncesFacet is Nonces, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _NONCES_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.nonces.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(INonces).interfaceId);
    }
}
