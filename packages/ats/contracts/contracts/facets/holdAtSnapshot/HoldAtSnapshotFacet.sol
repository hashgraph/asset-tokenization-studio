// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldAtSnapshot, RESOLVER_KEY_HOLD_AT_SNAPSHOT } from "./IHoldAtSnapshot.sol";
import { HoldAtSnapshot } from "./HoldAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title  HoldAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the held-balance-at-snapshot query via
 *         `IHoldAtSnapshot`, registered under `RESOLVER_KEY_HOLD_AT_SNAPSHOT`.
 * @dev    Exposes one selector: `heldBalanceOfAtSnapshot`. Inherits read logic from
 *         `HoldAtSnapshot` and satisfies `IStaticFunctionSelectors` for Diamond proxy
 *         selector registration.
 */
contract HoldAtSnapshotFacet is HoldAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_HOLD_AT_SNAPSHOT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.heldBalanceOfAtSnapshot.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IHoldAtSnapshot).interfaceId);
    }
}
