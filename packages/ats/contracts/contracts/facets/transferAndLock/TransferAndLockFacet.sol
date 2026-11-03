// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RESOLVER_KEY_TRANSFER_AND_LOCK } from "../IAsset.sol";

import { TransferAndLockFacetBase } from "./TransferAndLockFacetBase.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title TransferAndLockFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that wires the TransferAndLock capability to its resolver key.
 * @dev Extends `TransferAndLockFacetBase` with the concrete resolver key and initialiser key
 *      bindings. All selector and interface registration is handled by the base contract.
 */
contract TransferAndLockFacet is TransferAndLockFacetBase {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_TRANSFER_AND_LOCK;
    }

    function _transferAndLockInitializerKey() internal pure override returns (bytes32) {
        return RESOLVER_KEY_TRANSFER_AND_LOCK;
    }
}
