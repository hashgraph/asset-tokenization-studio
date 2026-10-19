// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INonces, RESOLVER_KEY_NONCES } from "./INonces.sol";
import { Nonces } from "./Nonces.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title NoncesFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes per-account nonce reads as a selectable proxy function.
 * @dev Inherits `Nonces` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `RESOLVER_KEY_NONCES` identifies this
 *      facet within the diamond proxy.
 */
contract NoncesFacet is Nonces, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_NONCES;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeNonces.selector,
                this.nonces.selector,
                this.protectedTransferFromByPartitionNonce.selector,
                this.protectedRedeemFromByPartitionNonce.selector,
                this.protectedCreateHoldByPartitionNonce.selector,
                this.protectedClearingCreateHoldByPartitionNonce.selector,
                this.protectedClearingTransferByPartitionNonce.selector,
                this.protectedClearingRedeemByPartitionNonce.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(INonces).interfaceId);
    }
}
